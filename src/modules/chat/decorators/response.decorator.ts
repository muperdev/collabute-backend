import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';

export const createConversationDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new conversation' }),
    ApiResponse({
      status: 201,
      description: 'Conversation created successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
  );
};

export const findConversationsDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get user conversations' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'projectId', required: false, type: String }),
    ApiResponse({
      status: 200,
      description: 'Conversations retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const findConversationDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get conversation by ID' }),
    ApiResponse({
      status: 200,
      description: 'Conversation retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not a participant' }),
    ApiResponse({ status: 404, description: 'Conversation not found' }),
  );
};

export const sendMessageDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Send a message' }),
    ApiResponse({ status: 201, description: 'Message sent successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not a participant' }),
  );
};

export const getMessagesDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get conversation messages' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Messages retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not a participant' }),
    ApiResponse({ status: 404, description: 'Conversation not found' }),
  );
};

export const deleteMessageDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete a message' }),
    ApiResponse({ status: 200, description: 'Message deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to delete this message',
    }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );
};

export const addParticipantDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Add participant to conversation' }),
    ApiResponse({ status: 201, description: 'Participant added successfully' }),
    ApiResponse({
      status: 400,
      description: 'Bad request - User is already a participant',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Only admins can add participants',
    }),
    ApiResponse({ status: 404, description: 'Conversation not found' }),
  );
};

export const removeParticipantDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove participant from conversation' }),
    ApiResponse({
      status: 200,
      description: 'Participant removed successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to remove this participant',
    }),
    ApiResponse({
      status: 404,
      description: 'Conversation or participant not found',
    }),
  );
};

export const markAsReadDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark conversation as read' }),
    ApiResponse({ status: 200, description: 'Conversation marked as read' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not a participant' }),
    ApiResponse({ status: 404, description: 'Conversation not found' }),
  );
};
