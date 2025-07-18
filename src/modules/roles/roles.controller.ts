import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('roles')
@Controller('roles')
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all roles (Admin only)' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get role statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getRoleStats() {
    return this.rolesService.getRoleStats();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get role by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }
}