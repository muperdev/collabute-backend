import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { validateAndParseId } from '../../common/utils/id-validation.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Get default user role if no role is specified
    let roleId = createUserDto.roleId;
    if (!roleId) {
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });
      roleId = defaultRole?.id;
    }

    // Prepare user data with proper types
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roleId: _, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        emailVerified: userData.emailVerified ?? false,
        ...(roleId && { roleId }),
      },
      include: {
        role: true,
        developerProfile: {
          include: { skills: true },
        },
        leadProfile: {
          include: { specializations: true, calendar: true },
        },
        githubIntegration: {
          include: { githubRepositories: true },
        },
      },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, type, country } = query;

    return this.prisma.user.findMany({
      where: {
        ...(type && { type }),
        ...(country && { country }),
      },
      include: {
        role: true,
        _count: {
          select: {
            ownedProjects: true,
            assignedIssues: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: validateAndParseId(id, 'User ID') },
      include: {
        role: true,
        developerProfile: {
          include: { skills: true },
        },
        leadProfile: {
          include: { specializations: true, calendar: true },
        },
        githubIntegration: {
          include: { githubRepositories: true },
        },
        ownedProjects: true,
        participatingProjects: {
          include: { project: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if requester can access this user's data
    if (requesterId && requesterId !== id) {
      const requester = await this.prisma.user.findUnique({
        where: { id: validateAndParseId(requesterId, 'Requester ID') },
        include: { role: true },
      });

      if (!requester?.role || requester.role.name !== 'admin') {
        throw new ForbiddenException('You can only access your own profile');
      }
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, requesterId?: string) {
    if (requesterId && requesterId !== id) {
      const requester = await this.prisma.user.findUnique({
        where: { id: validateAndParseId(requesterId, 'Requester ID') },
        include: { role: true },
      });

      if (!requester?.role || requester.role.name !== 'admin') {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    return this.prisma.user.update({
      where: { id: validateAndParseId(id, 'User ID') },
      data: updateUserDto,
      include: {
        role: true,
        githubIntegration: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id: validateAndParseId(id, 'User ID') },
    });
  }

  async updateGitHubData(
    userId: string,
    githubData: any,
    requesterId?: string,
  ) {
    // Check if requester can update this user's GitHub data
    if (requesterId && requesterId !== userId) {
      const requester = await this.prisma.user.findUnique({
        where: { id: validateAndParseId(requesterId, 'Requester ID') },
        include: { role: true },
      });

      if (!requester?.role || requester.role.name !== 'admin') {
        throw new ForbiddenException(
          'You can only update your own GitHub data',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: validateAndParseId(userId, 'User ID') },
      data: {
        githubIntegration: {
          upsert: {
            where: { userId: validateAndParseId(userId, 'User ID') },
            update: {
              githubId: githubData.id?.toString(),
              githubUsername: githubData.login,
              githubConnected: true,
              githubConnectedAt: new Date(),
              githubRepositories: {
                upsert:
                  githubData.repositories?.map((repo: any) => ({
                    where: { repoId: repo.id.toString() },
                    update: {
                      name: repo.name,
                    },
                    create: {
                      repoId: repo.id.toString(),
                      name: repo.name,
                    },
                  })) || [],
              },
            },
            create: {
              githubId: githubData.id?.toString(),
              githubUsername: githubData.login,
              githubConnected: true,
              githubConnectedAt: new Date(),
              githubRepositories: {
                create:
                  githubData.repositories?.map((repo: any) => ({
                    repoId: repo.id.toString(),
                    name: repo.name,
                  })) || [],
              },
            },
          },
        },
      },
    });
  }
}
