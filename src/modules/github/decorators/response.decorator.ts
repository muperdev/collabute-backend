import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';

export const getGitHubUserDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get GitHub user info' }),
    ApiResponse({
      status: 200,
      description: 'GitHub user info retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const getGitHubRepositoriesDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get user GitHub repositories' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'per_page', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Repositories retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const getGitHubRepositoryDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get specific repository details' }),
    ApiResponse({
      status: 200,
      description: 'Repository details retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Repository not found' }),
  );
};

export const getRepositoryIssuesDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get repository issues' }),
    ApiQuery({
      name: 'state',
      required: false,
      enum: ['open', 'closed', 'all'],
    }),
    ApiResponse({
      status: 200,
      description: 'Repository issues retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const getRepositoryCommitsDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get repository commits' }),
    ApiQuery({ name: 'branch', required: false, type: String }),
    ApiResponse({
      status: 200,
      description: 'Repository commits retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const getRepositoryBranchesDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get repository branches' }),
    ApiResponse({
      status: 200,
      description: 'Repository branches retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const createGitHubIssueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create GitHub issue' }),
    ApiResponse({ status: 201, description: 'Issue created successfully' }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const syncRepositoryDataDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Sync repository data' }),
    ApiResponse({
      status: 200,
      description: 'Repository data synced successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const getWebhooksDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get repository webhooks' }),
    ApiResponse({
      status: 200,
      description: 'Webhooks retrieved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const createWebhookDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create repository webhook' }),
    ApiResponse({ status: 201, description: 'Webhook created successfully' }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const deleteWebhookDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete repository webhook' }),
    ApiResponse({ status: 200, description: 'Webhook deleted successfully' }),
    ApiResponse({
      status: 400,
      description: 'GitHub not connected or API error',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};
