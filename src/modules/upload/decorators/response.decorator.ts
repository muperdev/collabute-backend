import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';

export const getUploadConfigDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get UploadThing configuration for frontend' }),
  );
};