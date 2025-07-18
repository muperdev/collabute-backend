import {
  Controller,
  Get,
  Request as RequestDecorator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { getBetterAuthProfileDecorator } from './decorators/better-auth-example.decorator';

@ApiTags('Better Auth Example')
@Controller('better-auth-example')
export class BetterAuthExampleController {
  @Get('profile')
  @getBetterAuthProfileDecorator()
  async getProfile(@RequestDecorator() req: any) {
    return { user: req.user };
  }
}
