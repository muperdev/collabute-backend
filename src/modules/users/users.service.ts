import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

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

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        roleId,
      },
      include: {
        role: true,
        githubRepositories: true,
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
      where: { id },
      include: {
        role: true,
        githubRepositories: true,
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
        where: { id: requesterId },
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
        where: { id: requesterId },
        include: { role: true },
      });

      if (!requester?.role || requester.role.name !== 'admin') {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: true,
        githubRepositories: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
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
        where: { id: requesterId },
        include: { role: true },
      });

      if (!requester?.role || requester.role.name !== 'admin') {
        throw new ForbiddenException(
          'You can only update your own GitHub data',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
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
                fullName: repo.full_name,
                url: repo.html_url,
                isPrivate: repo.private,
                description: repo.description,
                language: repo.language,
                defaultBranch: repo.default_branch,
                updatedAt: new Date(repo.updated_at),
                pushedAt: new Date(repo.pushed_at),
              },
              create: {
                repoId: repo.id.toString(),
                name: repo.name,
                fullName: repo.full_name,
                url: repo.html_url,
                isPrivate: repo.private,
                description: repo.description,
                language: repo.language,
                defaultBranch: repo.default_branch,
                createdAt: new Date(repo.created_at),
                updatedAt: new Date(repo.updated_at),
                pushedAt: new Date(repo.pushed_at),
              },
            })) || [],
        },
      },
    });
  }
}
