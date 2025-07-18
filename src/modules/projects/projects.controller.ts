import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ConnectRepositoryDto,
} from './dto';
import {
  createProjectDecorator,
  findAllProjectsDecorator,
  findProjectByIdDecorator,
  findProjectBySlugDecorator,
  updateProjectDecorator,
  deleteProjectDecorator,
  connectRepositoryDecorator,
} from './decorators/response.decorator';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @createProjectDecorator()
  create(@Body() createProjectDto: CreateProjectDto, @RequestDecorator() req: any) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @findAllProjectsDecorator()
  findAll(@Query() query: any) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @findProjectByIdDecorator()
  findOne(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Get('slug/:slug')
  @findProjectBySlugDecorator()
  findBySlug(@Param('slug') slug: string, @RequestDecorator() req: any) {
    return this.projectsService.findBySlug(slug, req.user.id);
  }

  @Patch(':id')
  @updateProjectDecorator()
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @RequestDecorator() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @deleteProjectDecorator()
  remove(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/connect-repository')
  @connectRepositoryDecorator()
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
