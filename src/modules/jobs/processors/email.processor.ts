import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailJobData } from '../jobs.service';
import { EmailService } from '../../email/email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    const { to, subject, template, data } = job.data;

    this.logger.log(`Processing email job ${job.id} for ${to}`);

    try {
      const result = await this.emailService.sendEmail({
        to,
        subject,
        template,
        data,
      });

      this.logger.log(`Email sent successfully to ${to}, ID: ${result.id}`);
      return { success: true, recipient: to, emailId: result.id };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
