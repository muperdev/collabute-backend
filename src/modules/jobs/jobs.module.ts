import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { EmailProcessor } from './processors/email.processor';
import { GitHubSyncProcessor } from './processors/github-sync.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { GitHubModule } from '../github/github.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'email',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'github-sync',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 100,
        },
      },
    ),
    GitHubModule,
    EmailModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    EmailProcessor,
    GitHubSyncProcessor,
    NotificationsProcessor,
  ],
  exports: [JobsService],
})
export class JobsModule {}
