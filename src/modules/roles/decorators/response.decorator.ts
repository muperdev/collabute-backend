import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';

export const findAllRolesDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all roles (Admin only)' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const getRoleStatsDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get role statistics (Admin only)' }),
    ApiResponse({
      status: 200,
      description: 'Role statistics retrieved successfully',
    }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const findRoleByIdDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get role by ID (Admin only)' }),
    ApiResponse({ status: 200, description: 'Role retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Role not found' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};