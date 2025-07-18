import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

export const healthCheckDecorator = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Health check endpoint for frontend' }),
    ApiResponse({
      status: 200,
      description: 'Service is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          environment: { type: 'string', example: 'production' },
        },
      },
    }),
  );
};

export const testAuthenticationDecorator = () => {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiOperation({ summary: 'Test frontend API key authentication' }),
    ApiHeader({
      name: 'X-API-Key',
      description: 'Frontend API key',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Authentication successful',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Frontend authenticated successfully',
          },
          authenticated: { type: 'boolean', example: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' }),
  );
};