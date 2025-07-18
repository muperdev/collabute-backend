import {
  Controller,
  Get,
  UseGuards,
  Request as RequestDecorator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';

@ApiTags('Better Auth Example')
@Controller('better-auth-example')
export class BetterAuthExampleController {
  @Get('profile')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile using Better Auth' })
  async getProfile(@RequestDecorator() req: any) {
    return { user: req.user };
  }
}
