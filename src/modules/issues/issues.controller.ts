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
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import { BetterAuthGuard } from '../../common/guards/better-auth.guard';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new issue' })
  @ApiResponse({ status: 201, description: 'Issue created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a project collaborator',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  create(@Body() createIssueDto: CreateIssueDto, @RequestDecorator() req: any) {
    return this.issuesService.create(createIssueDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'assigneeId', required: false, type: String })
  @ApiQuery({ name: 'reporterId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Issues retrieved successfully' })
  findAll(@Query() query: any) {
    return this.issuesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID' })
  @ApiResponse({ status: 200, description: 'Issue retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update issue' })
  @ApiResponse({ status: 200, description: 'Issue updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this issue',
  })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @RequestDecorator() req: any,
  ) {
    return this.issuesService.update(id, updateIssueDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete issue' })
  @ApiResponse({ status: 200, description: 'Issue deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this issue',
  })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  remove(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.issuesService.remove(id, req.user.id);
  }
}
