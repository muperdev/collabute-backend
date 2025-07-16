import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string[]>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.user = user;

      const userSockets = this.connectedUsers.get(user.id) || [];
      userSockets.push(client.id);
      this.connectedUsers.set(user.id, userSockets);

      const userConversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId: user.id },
          },
        },
        select: { id: true },
      });

      userConversations.forEach((conv) => {
        client.join(`conversation:${conv.id}`);
      });

      client.emit('connected', {
        userId: user.id,
        message: 'Connected to chat',
      });
      this.logger.log(`User ${user.email} connected with socket ${client.id}`);

      client.broadcast.emit('user-online', { userId: user.id });
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId) || [];
      const updatedSockets = userSockets.filter(
        (socketId) => socketId !== client.id,
      );

      if (updatedSockets.length === 0) {
        this.connectedUsers.delete(client.userId);
        client.broadcast.emit('user-offline', { userId: client.userId });
      } else {
        this.connectedUsers.set(client.userId, updatedSockets);
      }

      this.logger.log(`User ${client.userId} disconnected socket ${client.id}`);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const message = await this.chatService.sendMessage(
        sendMessageDto,
        client.userId,
      );

      this.server
        .to(`conversation:${sendMessageDto.conversationId}`)
        .emit('new-message', {
          message,
          conversationId: sendMessageDto.conversationId,
        });

      client.emit('message-sent', { messageId: message.id });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      await this.chatService.findConversation(
        data.conversationId,
        client.userId,
      );
      client.join(`conversation:${data.conversationId}`);

      client.emit('joined-conversation', {
        conversationId: data.conversationId,
      });

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('user-joined', {
          userId: client.userId,
          conversationId: data.conversationId,
        });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave-conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.leave(`conversation:${data.conversationId}`);

    client.emit('left-conversation', { conversationId: data.conversationId });

    this.server.to(`conversation:${data.conversationId}`).emit('user-left', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.to(`conversation:${data.conversationId}`).emit('user-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.to(`conversation:${data.conversationId}`).emit('user-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      isTyping: false,
    });
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      await this.chatService.markAsRead(data.conversationId, client.userId);

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('conversation-read', {
          userId: client.userId,
          conversationId: data.conversationId,
          readAt: new Date(),
        });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async notifyConversationUpdate(
    conversationId: string,
    event: string,
    data: any,
  ) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  async notifyUserStatus(userId: string, status: 'online' | 'offline') {
    this.server.emit(`user-${status}`, { userId });
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
