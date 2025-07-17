import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplateData } from '../jobs/jobs.service';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: EmailTemplateData;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured. Email sending will be disabled.',
      );
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail({
    to,
    subject,
    template,
    data,
  }: EmailTemplate): Promise<{ success: boolean; id?: string }> {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled. Would have sent email to ${to} with subject: ${subject}`,
      );
      return { success: false };
    }

    try {
      const htmlContent = this.renderTemplate(template, data);

      const response = await this.resend.emails.send({
        from: 'Collabute <noreply@collabute.com>',
        to,
        subject,
        html: htmlContent,
      });

      this.logger.log(
        `Email sent successfully to ${to}, ID: ${response.data?.id}`,
      );
      return { success: true, id: response.data?.id };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  private renderTemplate(template: string, data: EmailTemplateData): string {
    const templates: Record<string, (data: EmailTemplateData) => string> = {
      welcome: (data) => {
        const welcomeData =
          data as import('../jobs/jobs.service').WelcomeEmailData;
        return `
          <h1>Welcome to Collabute!</h1>
          <p>Hi ${welcomeData.userName},</p>
          <p>Thanks for joining Collabute. We're excited to have you on board!</p>
          <p>Get started by creating your first project or joining an existing one.</p>
          <p>Best regards,<br>The Collabute Team</p>
        `;
      },
      'project-invitation': (data) => {
        const inviteData =
          data as import('../jobs/jobs.service').ProjectInvitationEmailData;
        return `
          <h1>You've been invited to join a project</h1>
          <p>Hi there,</p>
          <p>You've been invited to join <strong>${inviteData.projectName}</strong> by ${inviteData.inviterName}.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${inviteData.inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
          <p>Best regards,<br>The Collabute Team</p>
        `;
      },
      'issue-assigned': (data) => {
        const issueData =
          data as import('../jobs/jobs.service').IssueAssignedEmailData;
        return `
          <h1>You've been assigned to an issue</h1>
          <p>Hi ${issueData.assigneeName},</p>
          <p>You've been assigned to issue <strong>"${issueData.issueTitle}"</strong> in ${issueData.projectName}.</p>
          <p>Issue details:</p>
          <ul>
            <li><strong>Priority:</strong> ${issueData.priority || 'Normal'}</li>
            <li><strong>Due Date:</strong> ${issueData.dueDate || 'Not set'}</li>
          </ul>
          <p>Click the link below to view the issue:</p>
          <a href="${issueData.issueLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Issue</a>
          <p>Best regards,<br>The Collabute Team</p>
        `;
      },
    };

    const templateFunction = templates[template];
    if (!templateFunction) {
      this.logger.warn(`Template ${template} not found, using default`);
      return `<p>Template: ${template}</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    return templateFunction(data);
  }
}
