import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: any,
  ) {
    return this.chatService.createConversation(
      createConversationDto,
      req.user.id,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findConversations(@Request() req: any, @Query() query: any) {
    return this.chatService.findConversations(req.user.id, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a participant' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  findConversation(@Param('id') id: string, @Request() req: any) {
    return this.chatService.findConversation(id, req.user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a participant' })
  sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req: any) {
    return this.chatService.sendMessage(sendMessageDto, req.user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a participant' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getMessages(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Query() query: any,
  ) {
    return this.chatService.getMessages(conversationId, req.user.id, query);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this message',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  deleteMessage(@Param('id') messageId: string, @Request() req: any) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Add participant to conversation' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User is already a participant',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can add participants',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  addParticipant(
    @Param('id') conversationId: string,
    @Body() body: { participantId: string },
    @Request() req: any,
  ) {
    return this.chatService.addParticipant(
      conversationId,
      body.participantId,
      req.user.id,
    );
  }

  @Delete('conversations/:id/participants/:participantId')
  @ApiOperation({ summary: 'Remove participant from conversation' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to remove this participant',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation or participant not found',
  })
  removeParticipant(
    @Param('id') conversationId: string,
    @Param('participantId') participantId: string,
    @Request() req: any,
  ) {
    return this.chatService.removeParticipant(
      conversationId,
      participantId,
      req.user.id,
    );
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a participant' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  markAsRead(@Param('id') conversationId: string, @Request() req: any) {
    return this.chatService.markAsRead(conversationId, req.user.id);
  }
}
