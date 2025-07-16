import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GitHubSyncJobData } from '../jobs.service';
import { GitHubService } from '../../github/github.service';
import { PrismaService } from '../../../database/prisma.service';

@Processor('github-sync')
export class GitHubSyncProcessor {
  private readonly logger = new Logger(GitHubSyncProcessor.name);

  constructor(
    private githubService: GitHubService,
    private prisma: PrismaService,
  ) {}

  @Process('sync-repository')
  async handleRepositorySync(job: Job<GitHubSyncJobData>) {
    const { userId, repositoryId, accessToken } = job.data;

    this.logger.log(
      `Processing GitHub sync job ${job.id} for user ${userId}, repository ${repositoryId}`,
    );

    try {
      const repository = await this.prisma.gitHubRepository.findUnique({
        where: { id: repositoryId },
        include: { project: true },
      });

      if (!repository) {
        throw new Error(`Repository ${repositoryId} not found`);
      }

      this.logger.log(`Syncing repository: ${repository.fullName}`);

      const syncData = await this.githubService.syncRepositoryData(
        accessToken,
        repository.fullName,
      );

      await this.updateRepositoryData(repository.id, syncData);

      this.logger.log(`Successfully synced repository ${repository.fullName}`);

      return {
        success: true,
        repositoryId,
        syncedAt: new Date(),
        issuesCount: syncData.issues.length,
        commitsCount: syncData.commits.length,
        branchesCount: syncData.branches.length,
      };
    } catch (error) {
      this.logger.error(`Failed to sync repository for job ${job.id}:`, error);
      throw error;
    }
  }

  private async updateRepositoryData(repositoryId: string, syncData: any) {
    const { repository } = syncData;

    await this.prisma.gitHubRepository.update({
      where: { id: repositoryId },
      data: {
        description: repository.description,
        language: repository.language,
        defaultBranch: repository.default_branch,
        updatedAt: new Date(repository.updated_at),
        pushedAt: new Date(repository.pushed_at),
      },
    });
  }
}
