import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface WelcomeEmailData {
  userName: string;
}

export interface ProjectInvitationEmailData {
  projectName: string;
  inviterName: string;
  inviteLink: string;
}

export interface IssueAssignedEmailData {
  assigneeName: string;
  issueTitle: string;
  projectName: string;
  priority?: string;
  dueDate?: string;
  issueLink: string;
}

export type EmailTemplateData =
  | WelcomeEmailData
  | ProjectInvitationEmailData
  | IssueAssignedEmailData;

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: EmailTemplateData;
}

export interface GitHubSyncJobData {
  userId: string;
  repositoryId: string;
  accessToken: string;
}

export interface NotificationJobData {
  userId: string;
  type:
    | 'issue_assigned'
    | 'message_received'
    | 'project_invitation'
    | 'issue_comment';
  data: Record<string, unknown>;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue<EmailJobData>,
    @InjectQueue('github-sync')
    private githubSyncQueue: Queue<GitHubSyncJobData>,
    @InjectQueue('notifications')
    private notificationsQueue: Queue<NotificationJobData>,
  ) {}

  async sendEmail(emailData: EmailJobData, delay = 0) {
    return this.emailQueue.add('send-email', emailData, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Collabute!',
      template: 'welcome',
      data: { userName },
    });
  }

  async sendProjectInvitation(
    userEmail: string,
    projectName: string,
    inviterName: string,
  ) {
    //TODO: Add invite link
    return this.sendEmail({
      to: userEmail,
      subject: `You've been invited to ${projectName}`,
      template: 'project-invitation',
      data: { projectName, inviterName, inviteLink: 'https://example.com' },
    });
  }

  async sendIssueAssignedEmail(
    userEmail: string,
    issueTitle: string,
    projectName: string,
  ) {
    return this.sendEmail({
      to: userEmail,
      subject: `New issue assigned: ${issueTitle}`,
      template: 'issue-assigned',
      data: {
        //TODO: Add priority, due date, and issue link
        issueTitle,
        projectName,
        assigneeName: 'John Doe',
        issueLink: 'https://example.com',
      },
    });
  }

  async scheduleGitHubSync(syncData: GitHubSyncJobData, delay = 0) {
    return this.githubSyncQueue.add('sync-repository', syncData, {
      delay,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });
  }

  async schedulePeriodicGitHubSync(syncData: GitHubSyncJobData) {
    return this.githubSyncQueue.add('sync-repository', syncData, {
      repeat: { cron: '0 */6 * * *' }, // Every 6 hours
      attempts: 2,
    });
  }

  async sendNotification(notificationData: NotificationJobData, delay = 0) {
    return this.notificationsQueue.add('send-notification', notificationData, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async sendIssueAssignedNotification(
    userId: string,
    issueData: Record<string, unknown>,
  ) {
    return this.sendNotification({
      userId,
      type: 'issue_assigned',
      data: issueData,
    });
  }

  async sendMessageReceivedNotification(
    userId: string,
    messageData: Record<string, unknown>,
  ) {
    return this.sendNotification(
      {
        userId,
        type: 'message_received',
        data: messageData,
      },
      1000,
    ); // 1 second delay to batch notifications
  }

  async sendProjectInvitationNotification(
    userId: string,
    projectData: Record<string, unknown>,
  ) {
    return this.sendNotification({
      userId,
      type: 'project_invitation',
      data: projectData,
    });
  }

  async sendIssueCommentNotification(
    userId: string,
    commentData: Record<string, unknown>,
  ) {
    return this.sendNotification({
      userId,
      type: 'issue_comment',
      data: commentData,
    });
  }

  async getQueueStats() {
    const [emailStats, githubStats, notificationStats] = await Promise.all([
      this.getQueueInfo(this.emailQueue),
      this.getQueueInfo(this.githubSyncQueue),
      this.getQueueInfo(this.notificationsQueue),
    ]);

    return {
      email: emailStats,
      githubSync: githubStats,
      notifications: notificationStats,
    };
  }

  private async getQueueInfo(queue: Queue) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }

  async clearQueue(queueName: 'email' | 'github-sync' | 'notifications') {
    const queueMap = {
      email: this.emailQueue,
      'github-sync': this.githubSyncQueue,
      notifications: this.notificationsQueue,
    };

    const queue = queueMap[queueName];
    if (queue) {
      await queue.clean(0, 'completed');
      await queue.clean(0, 'failed');
      await queue.clean(0, 'active');
    }
  }

  async pauseQueue(queueName: 'email' | 'github-sync' | 'notifications') {
    const queueMap = {
      email: this.emailQueue,
      'github-sync': this.githubSyncQueue,
      notifications: this.notificationsQueue,
    };

    const queue = queueMap[queueName];
    if (queue) {
      await queue.pause();
    }
  }

  async resumeQueue(queueName: 'email' | 'github-sync' | 'notifications') {
    const queueMap = {
      email: this.emailQueue,
      'github-sync': this.githubSyncQueue,
      notifications: this.notificationsQueue,
    };

    const queue = queueMap[queueName];
    if (queue) {
      await queue.resume();
    }
  }
}
