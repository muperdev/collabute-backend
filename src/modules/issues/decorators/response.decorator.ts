import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';

export const createIssueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new issue' }),
    ApiResponse({ status: 201, description: 'Issue created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not a project collaborator',
    }),
    ApiResponse({ status: 404, description: 'Project not found' }),
  );
};

export const findAllIssuesDecorator = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all issues' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'projectId', required: false, type: String }),
    ApiQuery({ name: 'status', required: false, type: String }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'priority', required: false, type: String }),
    ApiQuery({ name: 'assigneeId', required: false, type: String }),
    ApiQuery({ name: 'reporterId', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Issues retrieved successfully' }),
  );
};

export const findIssueByIdDecorator = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get issue by ID' }),
    ApiResponse({ status: 200, description: 'Issue retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Issue not found' }),
  );
};

export const updateIssueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update issue' }),
    ApiResponse({ status: 200, description: 'Issue updated successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to update this issue',
    }),
    ApiResponse({ status: 404, description: 'Issue not found' }),
  );
};

export const deleteIssueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete issue' }),
    ApiResponse({ status: 200, description: 'Issue deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to delete this issue',
    }),
    ApiResponse({ status: 404, description: 'Issue not found' }),
  );
};