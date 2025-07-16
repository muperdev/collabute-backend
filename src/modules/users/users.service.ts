import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
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

  async findById(id: string) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

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
    const user = await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateGitHubData(userId: string, githubData: any) {
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
