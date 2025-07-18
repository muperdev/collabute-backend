import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { PrismaService } from '../../database/prisma.service';
import {
  getGitHubUserDecorator,
  getGitHubRepositoriesDecorator,
  getGitHubRepositoryDecorator,
  getRepositoryIssuesDecorator,
  getRepositoryCommitsDecorator,
  getRepositoryBranchesDecorator,
  createGitHubIssueDecorator,
  syncRepositoryDataDecorator,
  getWebhooksDecorator,
  createWebhookDecorator,
  deleteWebhookDecorator,
} from './decorators/response.decorator';

@ApiTags('github')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly githubService: GitHubService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('user')
  @getGitHubUserDecorator()
  async getUser(@RequestDecorator() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getUser(user.githubAccessToken);
  }

  @Get('repositories')
  @getGitHubRepositoriesDecorator()
  async getRepositories(@RequestDecorator() req: any, @Query() query: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    const { page = 1, per_page = 30 } = query;
    return this.githubService.getUserRepositories(
      user.githubAccessToken,
      page,
      per_page,
    );
  }

  @Get('repositories/:owner/:repo')
  @getGitHubRepositoryDecorator()
  async getRepository(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getRepository(
      user.githubAccessToken,
      `${owner}/${repo}`,
    );
  }

  @Get('repositories/:owner/:repo/issues')
  @getRepositoryIssuesDecorator()
  async getRepositoryIssues(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state: 'open' | 'closed' | 'all' = 'open',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getRepositoryIssues(
      user.githubAccessToken,
      `${owner}/${repo}`,
      state,
    );
  }

  @Get('repositories/:owner/:repo/commits')
  @getRepositoryCommitsDecorator()
  async getRepositoryCommits(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getRepositoryCommits(
      user.githubAccessToken,
      `${owner}/${repo}`,
      branch,
    );
  }

  @Get('repositories/:owner/:repo/branches')
  @getRepositoryBranchesDecorator()
  async getRepositoryBranches(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getRepositoryBranches(
      user.githubAccessToken,
      `${owner}/${repo}`,
    );
  }

  @Post('repositories/:owner/:repo/issues')
  @createGitHubIssueDecorator()
  async createIssue(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body()
    issueData: {
      title: string;
      body?: string;
      assignees?: string[];
      labels?: string[];
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.createIssue(
      user.githubAccessToken,
      `${owner}/${repo}`,
      issueData,
    );
  }

  @Get('repositories/:owner/:repo/sync')
  @syncRepositoryDataDecorator()
  async syncRepositoryData(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.syncRepositoryData(
      user.githubAccessToken,
      `${owner}/${repo}`,
    );
  }

  @Get('repositories/:owner/:repo/webhooks')
  @getWebhooksDecorator()
  async getWebhooks(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.getWebhooks(
      user.githubAccessToken,
      `${owner}/${repo}`,
    );
  }

  @Post('repositories/:owner/:repo/webhooks')
  @createWebhookDecorator()
  async createWebhook(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body()
    webhookData: {
      url: string;
      events?: string[];
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    return this.githubService.createWebhook(
      user.githubAccessToken,
      `${owner}/${repo}`,
      webhookData.url,
      webhookData.events,
    );
  }

  @Delete('repositories/:owner/:repo/webhooks/:hookId')
  @deleteWebhookDecorator()
  async deleteWebhook(
    @RequestDecorator() req: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('hookId') hookId: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.githubAccessToken) {
      throw new Error('GitHub not connected');
    }

    await this.githubService.deleteWebhook(
      user.githubAccessToken,
      `${owner}/${repo}`,
      hookId,
    );
    return { message: 'Webhook deleted successfully' };
  }
}
