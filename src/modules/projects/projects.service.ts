import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GitHubService } from '../github/github.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ConnectRepositoryDto,
} from './dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private githubService: GitHubService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId: userId,
        slug: this.generateSlug(createProjectDto.title),
        milestones: {
          ideaRefinement: 'not-started',
          documentation: 'not-started',
          design: 'not-started',
          development: 'not-started',
          testing: 'not-started',
          launch: 'not-started',
          maintenance: 'not-started',
          scaling: 'not-started',
        },
      },
      include: {
        owner: true,
        repository: true,
      },
    });

    // Create default conversation for project
    await this.prisma.conversation.create({
      data: {
        title: `${project.title} Discussion`,
        type: 'PROJECT',
        projectId: project.id,
        createdById: userId,
        participants: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
    });

    return project;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, type, status, ownerId } = query;

    return this.prisma.project.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
        ...(ownerId && { ownerId }),
      },
      include: {
        owner: true,
        repository: true,
        _count: {
          select: {
            collaborators: true,
            issues: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        repository: true,
        collaborators: {
          include: { user: true },
        },
        issues: {
          include: {
            assignees: true,
            reporter: true,
          },
        },
        conversations: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        owner: true,
        repository: true,
        collaborators: {
          include: { user: true },
        },
        issues: {
          include: {
            assignees: true,
            reporter: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        ...(updateProjectDto.title && {
          slug: this.generateSlug(updateProjectDto.title),
        }),
      },
      include: {
        owner: true,
        repository: true,
      },
    });
  }

  async remove(id: string) {
    const project = await this.findOne(id);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async connectRepository(
    projectId: string,
    connectRepoDto: ConnectRepositoryDto,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.githubAccessToken) {
      throw new BadRequestException(
        'GitHub not connected. Please connect your GitHub account first.',
      );
    }

    try {
      const repoData = await this.githubService.getRepository(
        user.githubAccessToken,
        connectRepoDto.repoFullName,
      );

      return this.prisma.project.update({
        where: { id: projectId },
        data: {
          repository: {
            upsert: {
              where: { projectId },
              update: {
                repoId: repoData.id.toString(),
                name: repoData.name,
                fullName: repoData.full_name,
                url: repoData.html_url,
                isPrivate: repoData.private,
                description: repoData.description,
                language: repoData.language,
                defaultBranch: repoData.default_branch,
                updatedAt: new Date(repoData.updated_at),
                pushedAt: new Date(repoData.pushed_at),
              },
              create: {
                repoId: repoData.id.toString(),
                name: repoData.name,
                fullName: repoData.full_name,
                url: repoData.html_url,
                isPrivate: repoData.private,
                description: repoData.description,
                language: repoData.language,
                defaultBranch: repoData.default_branch,
                createdAt: new Date(repoData.created_at),
                updatedAt: new Date(repoData.updated_at),
                pushedAt: new Date(repoData.pushed_at),
              },
            },
          },
        },
        include: {
          repository: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to connect repository: ${error.message}`,
      );
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
