import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
        ownerId: parseInt(userId),
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
        createdById: parseInt(userId),
        participants: {
          create: {
            userId: parseInt(userId),
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

  async findOne(id: string, userId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: parseInt(id) },
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

    // Check access for private projects
    if (project.repository?.isPrivate && userId) {
      const hasAccess = await this.checkProjectAccess(project.id.toString(), userId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this private project',
        );
      }
    }

    return project;
  }

  async findBySlug(slug: string, userId?: string) {
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

    // Check access for private projects
    if (project.repository?.isPrivate && userId) {
      const hasAccess = await this.checkProjectAccess(project.id.toString(), userId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this private project',
        );
      }
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id);

    // Check if user has permission to update this project
    const hasPermission = await this.checkProjectUpdatePermission(
      project.id.toString(),
      userId,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update this project',
      );
    }

    return this.prisma.project.update({
      where: { id: parseInt(id) },
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

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);

    // Only project owner or admin can delete
    if (project.ownerId !== parseInt(userId)) {
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { role: true },
      });

      if (!user?.role || user.role.name !== 'admin') {
        throw new ForbiddenException(
          'Only project owner or admin can delete this project',
        );
      }
    }

    return this.prisma.project.delete({
      where: { id: parseInt(id) },
    });
  }

  async connectRepository(
    projectId: string,
    connectRepoDto: ConnectRepositoryDto,
    userId: string,
  ) {
    // Check if user has permission to connect repository
    const hasPermission = await this.checkProjectUpdatePermission(
      projectId,
      userId,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to connect repository to this project',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { githubIntegration: true },
    });

    if (!user?.githubIntegration?.githubAccessToken) {
      throw new BadRequestException(
        'GitHub not connected. Please connect your GitHub account first.',
      );
    }

    try {
      const repoData = await this.githubService.getRepository(
        user.githubIntegration.githubAccessToken,
        connectRepoDto.repoFullName,
      );

      return this.prisma.project.update({
        where: { id: parseInt(projectId) },
        data: {
          repository: {
            upsert: {
              where: { projectId: parseInt(projectId) },
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

  private async checkProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        collaborators: true,
      },
    });

    if (!project) return false;

    // Owner has access
    if (project.ownerId === parseInt(userId)) return true;

    // Check if user is a collaborator
    const isCollaborator = project.collaborators.some(
      (collab) => collab.userId === parseInt(userId),
    );
    if (isCollaborator) return true;

    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { role: true },
    });

    return user?.role?.name === 'admin';
  }

  private async checkProjectUpdatePermission(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        collaborators: true,
      },
    });

    if (!project) return false;

    // Owner can update
    if (project.ownerId === parseInt(userId)) return true;

    // Check if user is a team lead collaborator
    const collaborator = project.collaborators.find(
      (collab) => collab.userId === parseInt(userId),
    );
    if (collaborator) return true;

    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { role: true },
    });

    return user?.role?.name === 'admin';
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
