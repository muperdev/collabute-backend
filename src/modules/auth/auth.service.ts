import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        profilePicture: registerDto.profilePicture,
      },
      include: {
        role: true,
      },
    });

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    if (user.password && loginDto.password) {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: user.role,
      },
    };
  }

  async githubLogin(githubUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { githubId: githubUser.githubId },
      include: { role: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: githubUser.email,
          name: githubUser.name,
          profilePicture: githubUser.profilePicture,
          githubId: githubUser.githubId,
          githubUsername: githubUser.githubUsername,
          githubConnected: true,
          githubConnectedAt: new Date(),
          githubAccessToken: githubUser.githubAccessToken,
        },
        include: { role: true },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          githubAccessToken: githubUser.githubAccessToken,
          githubConnectedAt: new Date(),
        },
        include: { role: true },
      });
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: user.role,
        githubConnected: user.githubConnected,
      },
    };
  }

  async validateUser(payload: any) {
    return await this.usersService.findById(payload.sub);
  }
}
