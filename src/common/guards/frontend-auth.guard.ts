import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FrontendAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check for API Key authentication (for frontend identification)
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return this.validateApiKey(apiKey, request);
    }

    // Check for JWT authentication (for user sessions)
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return this.validateJwt(authorization.substring(7), request);
    }

    throw new UnauthorizedException('No valid authentication method provided');
  }

  private validateApiKey(apiKey: string, request: any): boolean {
    const validApiKey = this.configService.get('FRONTEND_API_KEY');

    if (!validApiKey) {
      throw new UnauthorizedException('API Key validation not configured');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Mark request as frontend authenticated
    request.isFrontendAuthenticated = true;
    return true;
  }

  private async validateJwt(token: string, request: any): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
