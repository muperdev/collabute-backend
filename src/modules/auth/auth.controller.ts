import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GitHubAuthGuard } from '../../common/guards/github-auth.guard';
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
  @UseGuards(GitHubAuthGuard)
  async githubAuth() {
    // This will redirect to GitHub
  }

  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.githubLogin(req.user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return req.user;
  }
}
