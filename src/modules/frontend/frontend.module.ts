import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FrontendController } from './frontend.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FrontendController],
})
export class FrontendModule {}
