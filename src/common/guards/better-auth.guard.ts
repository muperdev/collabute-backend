import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Injectable()
export class BetterAuthGuard extends AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}