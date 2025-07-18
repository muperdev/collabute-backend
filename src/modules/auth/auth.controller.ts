import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Headers,
  Request as RequestDecorator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';
import { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'GitHub OAuth login' })
  @Get('github')
  async githubAuth(@Res() res: Response) {
    // Better Auth automatically handles OAuth at /api/auth/github
    // This endpoint redirects to Better Auth's built-in GitHub OAuth handler
    const githubAuthUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/github`;
    res.redirect(githubAuthUrl);
  }

  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @Get('github/callback')
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Better Auth automatically handles the callback at /api/auth/github/callback
    // This endpoint is for documentation purposes - actual callback is handled by Better Auth
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(BetterAuthGuard)
  async getProfile(@RequestDecorator() req: any) {
    return { user: req.user };
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(BetterAuthGuard)
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
