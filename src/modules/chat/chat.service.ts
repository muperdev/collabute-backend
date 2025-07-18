import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateConversationDto, SendMessageDto, ConversationType } from './dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createConversation(
    createConversationDto: CreateConversationDto,
    userId: string,
  ) {
    if (
      createConversationDto.type === ConversationType.PROJECT &&
      !createConversationDto.projectId
    ) {
      throw new BadRequestException(
        'Project ID is required for project conversations',
      );
    }

    if (createConversationDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: parseInt(createConversationDto.projectId) },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isCollaborator =
        project.ownerId === parseInt(userId) ||
        project.collaborators.some((collab) => collab.userId === parseInt(userId));

      if (!isCollaborator) {
        throw new ForbiddenException(
          'You are not authorized to create conversations in this project',
        );
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        title: createConversationDto.title,
        type: createConversationDto.type,
        projectId: createConversationDto.projectId ? parseInt(createConversationDto.projectId) : null,
        createdById: parseInt(userId),
        participants: {
          create: [
            {
              userId: parseInt(userId),
              role: 'ADMIN',
            },
            ...(createConversationDto.participantIds || []).map(
              (participantId) => ({
                userId: parseInt(participantId),
                role: 'MEMBER' as const,
              }),
            ),
          ],
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
        project: true,
        createdBy: true,
      },
    });

    return conversation;
  }

  async findConversations(
    userId: string,
    query: {
      page: number;
      limit: number;
      type: ConversationType;
      projectId: string;
    },
  ) {
    const { page = 1, limit = 20, type, projectId } = query;

    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: parseInt(userId) },
        },
        ...(type && { type }),
        ...(projectId && { projectId: parseInt(projectId) }),
      },
      include: {
        participants: {
          include: { user: true },
        },
        project: true,
        createdBy: true,
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        participants: {
          include: { user: true },
        },
        project: true,
        createdBy: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === parseInt(userId),
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    return conversation;
  }

  async sendMessage(sendMessageDto: SendMessageDto, userId: string) {
    if (sendMessageDto.replyToId) {
      const replyTo = await this.prisma.message.findUnique({
        where: { id: parseInt(sendMessageDto.replyToId) },
      });

      if (
        !replyTo ||
        replyTo.conversationId !== parseInt(sendMessageDto.conversationId)
      ) {
        throw new BadRequestException('Invalid reply-to message');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        content: sendMessageDto.content,
        conversationId: parseInt(sendMessageDto.conversationId),
        senderId: parseInt(userId),
        replyToId: sendMessageDto.replyToId ? parseInt(sendMessageDto.replyToId) : null,
      },
      include: {
        sender: true,
        replyTo: {
          include: {
            sender: true,
          },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: parseInt(sendMessageDto.conversationId) },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: { page: number; limit: number },
  ) {
    await this.findConversation(conversationId, userId);

    const { page = 1, limit = 50 } = query;

    return this.prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      include: {
        sender: true,
        replyTo: {
          include: {
            sender: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: parseInt(messageId) },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const isAuthorized =
      message.senderId === parseInt(userId) ||
      message.conversation.participants.some(
        (p) => p.userId === parseInt(userId) && p.role === 'ADMIN',
      );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to delete this message',
      );
    }

    return this.prisma.message.delete({
      where: { id: parseInt(messageId) },
    });
  }

  async addParticipant(
    conversationId: string,
    participantId: string,
    userId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const userParticipant = conversation.participants.find(
      (p) => p.userId === parseInt(userId),
    );
    if (!userParticipant || userParticipant.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can add participants');
    }

    const existingParticipant = conversation.participants.find(
      (p) => p.userId === parseInt(participantId),
    );
    if (existingParticipant) {
      throw new BadRequestException('User is already a participant');
    }

    const participant = await this.prisma.conversationParticipant.create({
      data: {
        conversationId: parseInt(conversationId),
        userId: parseInt(participantId),
        role: 'MEMBER',
      },
      include: {
        user: true,
      },
    });

    return participant;
  }

  async removeParticipant(
    conversationId: string,
    participantId: string,
    userId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const userParticipant = conversation.participants.find(
      (p) => p.userId === parseInt(userId),
    );
    const targetParticipant = conversation.participants.find(
      (p) => p.userId === parseInt(participantId),
    );

    if (!targetParticipant) {
      throw new NotFoundException('Participant not found');
    }

    const canRemove =
      userParticipant?.role === 'ADMIN' || userId === participantId;
    if (!canRemove) {
      throw new ForbiddenException(
        'You are not authorized to remove this participant',
      );
    }

    await this.prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(participantId),
        },
      },
    });

    return { message: 'Participant removed successfully' };
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.findConversation(conversationId, userId);

    // Get the latest message in the conversation
    const latestMessage = await this.prisma.message.findFirst({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { createdAt: 'desc' },
    });

    if (latestMessage) {
      await this.prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: parseInt(conversationId),
            userId: parseInt(userId),
          },
        },
        data: {
          lastReadMessageId: latestMessage.id,
        },
      });
    }

    return { message: 'Conversation marked as read' };
  }
}
