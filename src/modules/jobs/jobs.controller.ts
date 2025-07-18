import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import {
  getQueueStatsDecorator,
  sendTestEmailDecorator,
  triggerGitHubSyncDecorator,
  sendTestNotificationDecorator,
  pauseQueueDecorator,
  resumeQueueDecorator,
  clearQueueDecorator,
} from './decorators/response.decorator';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @getQueueStatsDecorator()
  getQueueStats() {
    return this.jobsService.getQueueStats();
  }

  @Post('email/test')
  @sendTestEmailDecorator()
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
  @triggerGitHubSyncDecorator()
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
  @sendTestNotificationDecorator()
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
  @pauseQueueDecorator()
  async pauseQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.pauseQueue(queueName);
    return { message: `Queue ${queueName} paused successfully` };
  }

  @Post('queues/:queueName/resume')
  @resumeQueueDecorator()
  async resumeQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.resumeQueue(queueName);
    return { message: `Queue ${queueName} resumed successfully` };
  }

  @Post('queues/:queueName/clear')
  @clearQueueDecorator()
  async clearQueue(
    @Param('queueName') queueName: 'email' | 'github-sync' | 'notifications',
  ) {
    await this.jobsService.clearQueue(queueName);
    return { message: `Queue ${queueName} cleared successfully` };
  }
}
