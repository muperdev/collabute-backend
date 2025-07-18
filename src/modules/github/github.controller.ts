import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('github')
@Controller('github')
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class GitHubController {
  constructor(
    private readonly githubService: GitHubService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('user')
  @ApiOperation({ summary: 'Get GitHub user info' })
  @ApiResponse({
    status: 200,
    description: 'GitHub user info retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get user GitHub repositories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Repositories retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get specific repository details' })
  @ApiResponse({
    status: 200,
    description: 'Repository details retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Repository not found' })
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
  @ApiOperation({ summary: 'Get repository issues' })
  @ApiQuery({ name: 'state', required: false, enum: ['open', 'closed', 'all'] })
  @ApiResponse({
    status: 200,
    description: 'Repository issues retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get repository commits' })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Repository commits retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get repository branches' })
  @ApiResponse({
    status: 200,
    description: 'Repository branches retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Create GitHub issue' })
  @ApiResponse({ status: 201, description: 'Issue created successfully' })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Sync repository data' })
  @ApiResponse({
    status: 200,
    description: 'Repository data synced successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get repository webhooks' })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved successfully' })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Create repository webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Delete repository webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'GitHub not connected or API error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
