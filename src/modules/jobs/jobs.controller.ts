import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get queue statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getQueueStats() {
    return this.jobsService.getQueueStats();
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 201, description: 'Test email queued successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestEmail(@RequestDecorator() req: any) {
    const user = req.user;
    return this.jobsService.sendEmail({
      to: user.email,
      subject: 'Test Email from Collabute',
      template: 'welcome',
      data: { userName: user.name || user.email },
    });
  }

  @Post('github-sync/:repositoryId')
  @ApiOperation({ summary: 'Trigger GitHub repository sync' })
  @ApiResponse({
    status: 201,
    description: 'GitHub sync job queued successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerGitHubSync(
    @Param('repositoryId') repositoryId: string,
    @RequestDecorator() req: any,
  ) {
    const user = req.user;

    // Note: In a real implementation, you'd fetch the user's GitHub access token
    // and validate they have access to this repository
    return this.jobsService.scheduleGitHubSync({
      userId: user.id,
      repositoryId,
      accessToken: 'mock-token', // This should come from the user's stored GitHub token
    });
  }

  @Post('notifications/test')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({
    status: 201,
    description: 'Test notification queued successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestNotification(@RequestDecorator() req: any) {
    const user = req.user;
    return this.jobsService.sendNotification({
      userId: user.id,
      type: 'message_received',
      data: {
        senderName: 'System',
        message: 'This is a test notification',
      },
    });
  }

  @Post('queues/:queueName/pause')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Pause a queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue paused successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async pauseQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.pauseQueue(queueName);
    return { message: `Queue ${queueName} paused successfully` };
  }

  @Post('queues/:queueName/resume')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Resume a queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue resumed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async resumeQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.resumeQueue(queueName);
    return { message: `Queue ${queueName} resumed successfully` };
  }

  @Post('queues/:queueName/clear')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Clear a queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async clearQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.clearQueue(queueName);
    return { message: `Queue ${queueName} cleared successfully` };
  }
}
