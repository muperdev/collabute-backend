import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { auth } from '../../auth';
import { validateAndParseId } from '../../common/utils/id-validation.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Use Better Auth to create user
      const response = await auth.api.signUpEmail({
        body: {
          email: registerDto.email,
          password: registerDto.password,
          name: registerDto.name,
        },
      });

      if (!response.user) {
        throw new UnauthorizedException('Registration failed');
      }

      // Get default user role and update user with additional data
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: validateAndParseId(response.user.id, 'User ID') },
        data: {
          profilePicture: registerDto.profilePicture,
          roleId: defaultRole?.id,
        },
        include: {
          role: true,
        },
      });

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          type: updatedUser.type,
          role: updatedUser.role,
        },
        token: response.token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const response = await auth.api.signInEmail({
        body: {
          email: loginDto.email,
          password: loginDto.password,
        },
      });

      if (!response.user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get user with role information
      const user = await this.usersService.findById(response.user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          role: user.role,
        },
        token: response.token,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid credentials' + (error.message ? `: ${error.message}` : ''),
      );
    }
  }

  // GitHub OAuth is now handled automatically by Better Auth
  // Custom GitHub user processing can be done via Better Auth hooks if needed

  async validateUser(userId: string) {
    return await this.usersService.findById(userId);
  }

  async logout(sessionToken: string) {
    try {
      await auth.api.signOut({
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Logout failed', error.message);
    }
  }
}
