import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getQueueStats() {
    return this.jobsService.getQueueStats();
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 201, description: 'Test email queued successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestEmail(@Request() req: any) {
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
    @Request() req: any,
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
  async sendTestNotification(@Request() req: any) {
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
  @ApiOperation({ summary: 'Pause a queue' })
  @ApiResponse({ status: 200, description: 'Queue paused successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async pauseQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.pauseQueue(queueName);
    return { message: `Queue ${queueName} paused successfully` };
  }

  @Post('queues/:queueName/resume')
  @ApiOperation({ summary: 'Resume a queue' })
  @ApiResponse({ status: 200, description: 'Queue resumed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resumeQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.resumeQueue(queueName);
    return { message: `Queue ${queueName} resumed successfully` };
  }

  @Post('queues/:queueName/clear')
  @ApiOperation({ summary: 'Clear a queue' })
  @ApiResponse({ status: 200, description: 'Queue cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.clearQueue(queueName);
    return { message: `Queue ${queueName} cleared successfully` };
  }
}
