import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

export const registerDecorator = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user (Legacy - Deprecated)',
      description:
        '⚠️ **DEPRECATED**: This endpoint is deprecated. Use Better Auth endpoints instead: `POST /api/auth/sign-up/email`',
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              role: { type: 'object' },
            },
          },
          token: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Invalid registration data' }),
  );
};

export const loginDecorator = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user (Legacy - Deprecated)',
      description:
        '⚠️ **DEPRECATED**: This endpoint is deprecated. Use Better Auth endpoints instead: `POST /api/auth/sign-in/email`',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'User logged in successfully',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              role: { type: 'object' },
            },
          },
          token: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
  );
};

export const githubAuthDecorator = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'GitHub OAuth login (Redirect)',
      description:
        'Redirects to Better Auth GitHub OAuth handler at `/api/auth/github`',
    }),
    ApiResponse({ status: 302, description: 'Redirects to GitHub OAuth' }),
  );
};

export const githubCallbackDecorator = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'GitHub OAuth callback (Redirect)',
      description:
        'Redirects to frontend callback page. Actual OAuth handling is done by Better Auth at `/api/auth/github/callback`',
    }),
    ApiResponse({ status: 302, description: 'Redirects to frontend callback' }),
  );
};

export const getProfileDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth('BetterAuth'),
    ApiOperation({
      summary: 'Get current user profile',
      description:
        'Returns the authenticated user profile. Requires Better Auth session token.',
    }),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              role: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  displayName: { type: 'string' },
                  permissions: { type: 'object' },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or expired session',
    }),
  );
};

export const logoutDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth('BetterAuth'),
    ApiOperation({
      summary: 'Logout user',
      description:
        'Invalidates the current Better Auth session. Requires Better Auth session token.',
    }),
    ApiResponse({
      status: 200,
      description: 'User logged out successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logged out successfully' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or expired session',
    }),
  );
};