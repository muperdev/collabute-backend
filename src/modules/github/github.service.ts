import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

@Injectable()
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com';

  constructor(private configService: ConfigService) {}

  private async makeRequest(
    url: string,
    accessToken: string,
    options: RequestInit = {},
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Collabute-Backend',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new BadRequestException(
        `GitHub API error: ${response.statusText} - ${errorData.message || 'Unknown error'}`,
      );
    }

    return response.json();
  }

  async getUser(accessToken: string): Promise<GitHubUser> {
    return this.makeRequest('/user', accessToken);
  }

  async getRepository(
    accessToken: string,
    repoFullName: string,
  ): Promise<GitHubRepository> {
    return this.makeRequest(`/repos/${repoFullName}`, accessToken);
  }

  async getUserRepositories(
    accessToken: string,
    page = 1,
    perPage = 30,
  ): Promise<GitHubRepository[]> {
    return this.makeRequest(
      `/user/repos?page=${page}&per_page=${perPage}&sort=updated`,
      accessToken,
    );
  }

  async getRepositoryIssues(
    accessToken: string,
    repoFullName: string,
    state: 'open' | 'closed' | 'all' = 'open',
  ): Promise<GitHubIssue[]> {
    return this.makeRequest(
      `/repos/${repoFullName}/issues?state=${state}`,
      accessToken,
    );
  }

  async getRepositoryCommits(
    accessToken: string,
    repoFullName: string,
    branch?: string,
  ): Promise<GitHubCommit[]> {
    const url = `/repos/${repoFullName}/commits${branch ? `?sha=${branch}` : ''}`;
    return this.makeRequest(url, accessToken);
  }

  async getRepositoryBranches(
    accessToken: string,
    repoFullName: string,
  ): Promise<Array<{ name: string; commit: { sha: string } }>> {
    return this.makeRequest(`/repos/${repoFullName}/branches`, accessToken);
  }

  async getRepositoryContents(
    accessToken: string,
    repoFullName: string,
    path = '',
  ): Promise<any> {
    return this.makeRequest(
      `/repos/${repoFullName}/contents/${path}`,
      accessToken,
    );
  }

  async createIssue(
    accessToken: string,
    repoFullName: string,
    issueData: {
      title: string;
      body?: string;
      assignees?: string[];
      labels?: string[];
    },
  ): Promise<GitHubIssue> {
    return this.makeRequest(`/repos/${repoFullName}/issues`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(
    accessToken: string,
    repoFullName: string,
    issueNumber: number,
    updateData: {
      title?: string;
      body?: string;
      state?: 'open' | 'closed';
      assignees?: string[];
      labels?: string[];
    },
  ): Promise<GitHubIssue> {
    return this.makeRequest(
      `/repos/${repoFullName}/issues/${issueNumber}`,
      accessToken,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    );
  }

  async createWebhook(
    accessToken: string,
    repoFullName: string,
    webhookUrl: string,
    events: string[] = ['push', 'issues', 'pull_request'],
  ): Promise<any> {
    return this.makeRequest(`/repos/${repoFullName}/hooks`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events,
        config: {
          url: webhookUrl,
          content_type: 'json',
        },
      }),
    });
  }

  async getWebhooks(accessToken: string, repoFullName: string): Promise<any[]> {
    return this.makeRequest(`/repos/${repoFullName}/hooks`, accessToken);
  }

  async deleteWebhook(
    accessToken: string,
    repoFullName: string,
    hookId: number,
  ): Promise<void> {
    await this.makeRequest(
      `/repos/${repoFullName}/hooks/${hookId}`,
      accessToken,
      {
        method: 'DELETE',
      },
    );
  }

  async syncRepositoryData(
    accessToken: string,
    repoFullName: string,
  ): Promise<{
    repository: GitHubRepository;
    issues: GitHubIssue[];
    commits: GitHubCommit[];
    branches: Array<{ name: string; commit: { sha: string } }>;
  }> {
    const [repository, issues, commits, branches] = await Promise.all([
      this.getRepository(accessToken, repoFullName),
      this.getRepositoryIssues(accessToken, repoFullName, 'all'),
      this.getRepositoryCommits(accessToken, repoFullName),
      this.getRepositoryBranches(accessToken, repoFullName),
    ]);

    return {
      repository,
      issues,
      commits,
      branches,
    };
  }
}
