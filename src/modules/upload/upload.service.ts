import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  constructor(private configService: ConfigService) {
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

  deleteFile(key: string): void {
    // Note: UploadThing doesn't have a direct delete method in the server SDK
    // You would need to use the REST API or implement a webhook
    this.logger.log(`File deletion requested for key: ${key}`);
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
}
