import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get UploadThing configuration for frontend' })
  getUploadConfig() {
    return this.uploadService.getUploadConfig();
  }
}
