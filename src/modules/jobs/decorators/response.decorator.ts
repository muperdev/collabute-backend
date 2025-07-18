import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';

export const getQueueStatsDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get queue statistics (Admin only)' }),
    ApiResponse({
      status: 200,
      description: 'Queue statistics retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const sendTestEmailDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Send test email' }),
    ApiResponse({ status: 201, description: 'Test email queued successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const triggerGitHubSyncDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Trigger GitHub repository sync' }),
    ApiResponse({
      status: 201,
      description: 'GitHub sync job queued successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const sendTestNotificationDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Send test notification' }),
    ApiResponse({
      status: 201,
      description: 'Test notification queued successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};

export const pauseQueueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Pause a queue (Admin only)' }),
    ApiResponse({ status: 200, description: 'Queue paused successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const resumeQueueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Resume a queue (Admin only)' }),
    ApiResponse({ status: 200, description: 'Queue resumed successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const clearQueueDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Clear a queue (Admin only)' }),
    ApiResponse({ status: 200, description: 'Queue cleared successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};