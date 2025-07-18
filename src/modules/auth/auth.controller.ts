import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  Headers,
  Request as RequestDecorator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Request, Response } from 'express';
import {
  registerDecorator,
  loginDecorator,
  githubAuthDecorator,
  githubCallbackDecorator,
  getProfileDecorator,
  logoutDecorator,
} from './decorators/response.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @registerDecorator()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @loginDecorator()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('github')
  @githubAuthDecorator()
  async githubAuth(@Res() res: Response) {
    // Better Auth automatically handles OAuth at /api/auth/github
    // This endpoint redirects to Better Auth's built-in GitHub OAuth handler
    const githubAuthUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/github`;
    res.redirect(githubAuthUrl);
  }

  @Get('github/callback')
  @githubCallbackDecorator()
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Better Auth automatically handles the callback at /api/auth/github/callback
    // This endpoint is for documentation purposes - actual callback is handled by Better Auth
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  @Get('profile')
  @getProfileDecorator()
  async getProfile(@RequestDecorator() req: any) {
    return { user: req.user };
  }

  @Post('logout')
  @logoutDecorator()
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
