import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BetterAuthGuard } from '../../../common/guards/better-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';

export const createUserDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new user (Admin only)' }),
    ApiResponse({ status: 201, description: 'User created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const findAllUsersDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all users (Admin only)' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'country', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Users retrieved successfully' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};

export const findUserByIdDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get user by ID (Self or Admin only)' }),
    ApiResponse({ status: 200, description: 'User retrieved successfully' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 403, description: 'Access denied' }),
  );
};

export const updateUserDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update user (Self or Admin only)' }),
    ApiResponse({ status: 200, description: 'User updated successfully' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Access denied' }),
  );
};

export const deleteUserDecorator = () => {
  return applyDecorators(
    UseGuards(BetterAuthGuard, AdminGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete user (Admin only)' }),
    ApiResponse({ status: 200, description: 'User deleted successfully' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Admin access required' }),
  );
};
