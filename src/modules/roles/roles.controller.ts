import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  findAllRolesDecorator,
  getRoleStatsDecorator,
  findRoleByIdDecorator,
} from './decorators/response.decorator';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @findAllRolesDecorator()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('stats')
  @getRoleStatsDecorator()
  getRoleStats() {
    return this.rolesService.getRoleStats();
  }

  @Get(':id')
  @findRoleByIdDecorator()
  findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }
}
