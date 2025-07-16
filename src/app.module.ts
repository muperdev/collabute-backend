import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GitHubModule } from './modules/github/github.module';
import { IssuesModule } from './modules/issues/issues.module';
import { ChatModule } from './modules/chat/chat.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { RedisModule } from './modules/redis/redis.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.UPSTASH_REDIS_HOST!,
        port: parseInt(process.env.UPSTASH_REDIS_PORT!),
        password: process.env.UPSTASH_REDIS_PASSWORD!,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    GitHubModule,
    IssuesModule,
    ChatModule,
    JobsModule,
    RedisModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
