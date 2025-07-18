import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ConnectRepositoryDto,
} from './dto';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createProjectDto: CreateProjectDto, @RequestDecorator() req: any) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: any) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied for private project',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Get('slug/:slug')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project by slug' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied for private project',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findBySlug(@Param('slug') slug: string, @RequestDecorator() req: any) {
    return this.projectsService.findBySlug(slug, req.user.id);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (Owner/TeamLead/Admin only)' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @RequestDecorator() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Only project owner or admin can delete',
  })
  remove(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/connect-repository')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect GitHub repository to project' })
  @ApiResponse({
    status: 200,
    description: 'Repository connected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - GitHub not connected or repository not found',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  connectRepository(
    @Param('id') projectId: string,
    @Body() connectRepositoryDto: ConnectRepositoryDto,
    @RequestDecorator() req: any,
  ) {
    return this.projectsService.connectRepository(
      projectId,
      connectRepositoryDto,
      req.user.id,
    );
  }
}
