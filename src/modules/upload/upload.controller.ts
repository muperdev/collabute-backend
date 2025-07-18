import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { getUploadConfigDecorator } from './decorators/response.decorator';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('config')
  @getUploadConfigDecorator()
  getUploadConfig() {
    return this.uploadService.getUploadConfig();
  }
}
