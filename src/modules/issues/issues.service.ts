import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createIssueDto: CreateIssueDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: createIssueDto.projectId },
      include: { collaborators: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isCollaborator =
      project.ownerId === userId ||
      project.collaborators.some((collab) => collab.userId === userId);

    if (!isCollaborator) {
      throw new ForbiddenException(
        'You are not authorized to create issues in this project',
      );
    }

    if (createIssueDto.assigneeIds?.length) {
      const assignees = await this.prisma.user.findMany({
        where: { id: { in: createIssueDto.assigneeIds } },
      });

      if (assignees.length !== createIssueDto.assigneeIds.length) {
        throw new BadRequestException('One or more assignees not found');
      }
    }

    const slug = this.generateSlug(createIssueDto.title);

    const issue = await this.prisma.issue.create({
      data: {
        title: createIssueDto.title,
        slug,
        description: createIssueDto.description,
        longDescription: createIssueDto.longDescription,
        type: createIssueDto.type,
        category: createIssueDto.category || [],
        priority: createIssueDto.priority,
        status: createIssueDto.status || 'OPEN',
        projectId: createIssueDto.projectId,
        reporterId: userId,
        budget: createIssueDto.budget,
        labels: createIssueDto.labels || [],
        assignees: createIssueDto.assigneeIds
          ? {
              connect: createIssueDto.assigneeIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        reporter: true,
        assignees: true,
        project: true,
      },
    });

    return issue;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      projectId,
      status,
      type,
      priority,
      assigneeId,
      reporterId,
    } = query;

    return this.prisma.issue.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(assigneeId && { assignees: { some: { id: assigneeId } } }),
        ...(reporterId && { reporterId }),
      },
      include: {
        reporter: true,
        assignees: true,
        project: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: true,
        assignees: true,
        project: {
          include: {
            owner: true,
            collaborators: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return issue;
  }

  async update(id: string, updateIssueDto: UpdateIssueDto, userId: string) {
    const issue = await this.findOne(id);

    const isAuthorized =
      issue.reporterId === userId ||
      issue.project.ownerId === userId ||
      issue.project.collaborators.some((collab) => collab.userId === userId) ||
      issue.assignees.some((assignee) => assignee.id === userId);

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to update this issue',
      );
    }

    if (updateIssueDto.assigneeIds?.length) {
      const assignees = await this.prisma.user.findMany({
        where: { id: { in: updateIssueDto.assigneeIds } },
      });

      if (assignees.length !== updateIssueDto.assigneeIds.length) {
        throw new BadRequestException('One or more assignees not found');
      }
    }

    const updateData: any = {};

    if (updateIssueDto.title) {
      updateData.title = updateIssueDto.title;
      updateData.slug = this.generateSlug(updateIssueDto.title);
    }
    if (updateIssueDto.description !== undefined)
      updateData.description = updateIssueDto.description;
    if (updateIssueDto.longDescription !== undefined)
      updateData.longDescription = updateIssueDto.longDescription;
    if (updateIssueDto.type) updateData.type = updateIssueDto.type;
    if (updateIssueDto.category) updateData.category = updateIssueDto.category;
    if (updateIssueDto.priority) updateData.priority = updateIssueDto.priority;
    if (updateIssueDto.status) updateData.status = updateIssueDto.status;
    if (updateIssueDto.budget !== undefined)
      updateData.budget = updateIssueDto.budget;
    if (updateIssueDto.labels) updateData.labels = updateIssueDto.labels;

    if (updateIssueDto.assigneeIds) {
      updateData.assignees = {
        set: [],
        connect: updateIssueDto.assigneeIds.map((id) => ({ id })),
      };
    }

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        reporter: true,
        assignees: true,
        project: true,
      },
    });

    return updatedIssue;
  }

  async remove(id: string, userId: string) {
    const issue = await this.findOne(id);

    const isAuthorized =
      issue.reporterId === userId || issue.project.ownerId === userId;

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to delete this issue',
      );
    }

    return this.prisma.issue.delete({
      where: { id },
    });
  }
}
