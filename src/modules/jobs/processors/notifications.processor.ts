import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationJobData } from '../jobs.service';
import { PrismaService } from '../../../database/prisma.service';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>) {
    const { userId, type, data } = job.data;

    this.logger.log(
      `Processing notification job ${job.id} for user ${userId}, type: ${type}`,
    );

    try {
      const notification = await this.createNotification(userId, type, data);

      // Here you could also send push notifications, WebSocket events, etc.
      await this.sendRealTimeNotification(userId, notification);

      this.logger.log(`Notification sent successfully to user ${userId}`);
      return { success: true, notificationId: notification.id };
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  private async createNotification(userId: string, type: string, data: any) {
    const notificationMessages = {
      issue_assigned: `You've been assigned to issue "${data.title}"`,
      message_received: `You received a new message from ${data.senderName}`,
      project_invitation: `You've been invited to join project "${data.projectName}"`,
      issue_comment: `New comment on issue "${data.issueTitle}"`,
    };

    const message =
      notificationMessages[type as keyof typeof notificationMessages] ||
      `New notification of type: ${type}`;

    // Since there's no notification table, we'll just log for now
    this.logger.log(`Creating notification for user ${userId}: ${message}`);

    return {
      id: `mock-${Date.now()}`,
      userId,
      type: type.toUpperCase(),
      title: this.getNotificationTitle(type),
      message,
      data: JSON.stringify(data),
      isRead: false,
      createdAt: new Date(),
    };
  }

  private getNotificationTitle(type: string): string {
    const titles = {
      issue_assigned: 'Issue Assigned',
      message_received: 'New Message',
      project_invitation: 'Project Invitation',
      issue_comment: 'New Comment',
    };

    return titles[type as keyof typeof titles] || 'Notification';
  }

  private async sendRealTimeNotification(userId: string, notification: any) {
    // This would integrate with your WebSocket gateway to send real-time notifications
    // For now, we'll just log it
    this.logger.log(`Real-time notification would be sent to user ${userId}:`, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // In a real implementation, you might:
    // 1. Send WebSocket message through ChatGateway
    // 2. Send push notification to mobile devices
    // 3. Send email notification
    // 4. Update user's notification count in real-time
  }
}
