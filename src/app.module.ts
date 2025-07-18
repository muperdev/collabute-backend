import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
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
import { FrontendModule } from './modules/frontend/frontend.module';
import { auth } from './auth';

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
    BetterAuthModule.forRoot(auth),
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
    FrontendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
