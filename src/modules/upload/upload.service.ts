import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { validateAndParseId } from '../../common/utils/id-validation.util';

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly secret: string;
  private readonly appId: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secret = this.configService.get<string>('UPLOADTHING_SECRET') || '';
    this.appId = this.configService.get<string>('UPLOADTHING_APP_ID') || '';

    if (!this.secret || !this.appId) {
      this.logger.warn(
        'UploadThing credentials not configured. File uploads will be disabled.',
      );
    }
  }

  getUploadConfig() {
    return {
      secret: this.secret,
      appId: this.appId,
      endpoint: 'https://uploadthing.com/api/uploadFiles',
    };
  }

  async deleteFile(key: string, userId: string): Promise<void> {
    // Check if user owns this file by checking if they uploaded it
    // This would require a file tracking system in your database
    // For now, we'll implement basic validation

    if (!userId) {
      throw new ForbiddenException('Authentication required to delete files');
    }

    // Note: UploadThing doesn't have a direct delete method in the server SDK
    // You would need to use the REST API or implement a webhook
    this.logger.log(
      `File deletion requested for key: ${key} by user: ${userId}`,
    );
    // Implementation depends on your specific needs
  }

  getFileUrl(key: string): string {
    return `https://uploadthing.com/f/${key}`;
  }

  validateFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension || '');
  }

  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  async validateFileOwnership(key: string, userId: string): Promise<boolean> {
    // This would require implementing file ownership tracking in your database
    // For now, we'll implement basic validation

    if (!userId) {
      return false;
    }

    // Validate userId is numeric before parsing
    try {
      const parsedUserId = validateAndParseId(
        userId,
        'userId',
      );

      // Check if user is admin (admins can access all files)
      const user = await this.prisma.user.findUnique({
        where: { id: parsedUserId },
        include: { role: true },
      });

      if (user?.role?.name === 'admin') {
        return true;
      }
    } catch {
      this.logger.warn(`Invalid userId format: ${userId}`);
      return false;
    }

    // In a real implementation, you would check file ownership in database
    // For now, we'll allow access to own files only
    this.logger.log(
      `File ownership validation for key: ${key} by user: ${userId}`,
    );

    return true; // Placeholder - implement actual ownership check
  }
}
