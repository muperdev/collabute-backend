import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';

export const createProjectDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new project' }),
    ApiResponse({ status: 201, description: 'Project created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const findAllProjectsDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all projects' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'status', required: false, type: String }),
    ApiQuery({ name: 'ownerId', required: false, type: String }),
    ApiResponse({
      status: 200,
      description: 'Projects retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const findProjectByIdDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get project by ID' }),
    ApiResponse({ status: 200, description: 'Project retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Project not found' }),
    ApiResponse({
      status: 403,
      description: 'Access denied for private project',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const findProjectBySlugDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get project by slug' }),
    ApiResponse({ status: 200, description: 'Project retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Project not found' }),
    ApiResponse({
      status: 403,
      description: 'Access denied for private project',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const updateProjectDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update project (Owner/TeamLead/Admin only)' }),
    ApiResponse({ status: 200, description: 'Project updated successfully' }),
    ApiResponse({ status: 404, description: 'Project not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Insufficient permissions' }),
  );
};

export const deleteProjectDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete project (Owner/Admin only)' }),
    ApiResponse({ status: 200, description: 'Project deleted successfully' }),
    ApiResponse({ status: 404, description: 'Project not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Only project owner or admin can delete',
    }),
  );
};

export const connectRepositoryDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Connect GitHub repository to project' }),
    ApiResponse({
      status: 200,
      description: 'Repository connected successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - GitHub not connected or repository not found',
    }),
    ApiResponse({ status: 404, description: 'Project not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};
