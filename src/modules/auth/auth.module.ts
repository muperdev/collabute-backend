import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BetterAuthExampleController } from './better-auth-example.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController, BetterAuthExampleController],
  exports: [AuthService],
})
export class AuthModule {}
