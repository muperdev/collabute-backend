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
  Request,
} from '@nestjs/common';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(@Query() query: any) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get project by slug' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/connect-repository')
  @UseGuards(JwtAuthGuard)
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
    @Request() req: any,
  ) {
    return this.projectsService.connectRepository(
      projectId,
      connectRepositoryDto,
      req.user.id,
    );
  }
}
