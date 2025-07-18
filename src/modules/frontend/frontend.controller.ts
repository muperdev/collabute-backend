import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  healthCheckDecorator,
  testAuthenticationDecorator,
} from './decorators/response.decorator';

@ApiTags('frontend')
@Controller('frontend')
export class FrontendController {
  @Get('health')
  @healthCheckDecorator()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('auth-test')
  @testAuthenticationDecorator()
  testAuthentication() {
    return {
      message: 'Frontend authenticated successfully',
      authenticated: true,
    };
  }
}
