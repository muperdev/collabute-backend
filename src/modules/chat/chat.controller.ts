import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import {
  createConversationDecorator,
  findConversationsDecorator,
  findConversationDecorator,
  sendMessageDecorator,
  getMessagesDecorator,
  deleteMessageDecorator,
  addParticipantDecorator,
  removeParticipantDecorator,
  markAsReadDecorator,
} from './decorators/response.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @createConversationDecorator()
  createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @RequestDecorator() req: any,
  ) {
    return this.chatService.createConversation(
      createConversationDto,
      req.user.id,
    );
  }

  @Get('conversations')
  @findConversationsDecorator()
  findConversations(@RequestDecorator() req: any, @Query() query: any) {
    return this.chatService.findConversations(req.user.id, query);
  }

  @Get('conversations/:id')
  @findConversationDecorator()
  findConversation(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.chatService.findConversation(id, req.user.id);
  }

  @Post('messages')
  @sendMessageDecorator()
  sendMessage(@Body() sendMessageDto: SendMessageDto, @RequestDecorator() req: any) {
    return this.chatService.sendMessage(sendMessageDto, req.user.id);
  }

  @Get('conversations/:id/messages')
  @getMessagesDecorator()
  getMessages(
    @Param('id') conversationId: string,
    @RequestDecorator() req: any,
    @Query() query: any,
  ) {
    return this.chatService.getMessages(conversationId, req.user.id, query);
  }

  @Delete('messages/:id')
  @deleteMessageDecorator()
  deleteMessage(@Param('id') messageId: string, @RequestDecorator() req: any) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  @Post('conversations/:id/participants')
  @addParticipantDecorator()
  addParticipant(
    @Param('id') conversationId: string,
    @Body() body: { participantId: string },
    @RequestDecorator() req: any,
  ) {
    return this.chatService.addParticipant(
      conversationId,
      body.participantId,
      req.user.id,
    );
  }

  @Delete('conversations/:id/participants/:participantId')
  @removeParticipantDecorator()
  removeParticipant(
    @Param('id') conversationId: string,
    @Param('participantId') participantId: string,
    @RequestDecorator() req: any,
  ) {
    return this.chatService.removeParticipant(
      conversationId,
      participantId,
      req.user.id,
    );
  }

  @Post('conversations/:id/read')
  @markAsReadDecorator()
  markAsRead(@Param('id') conversationId: string, @RequestDecorator() req: any) {
    return this.chatService.markAsRead(conversationId, req.user.id);
  }
}
