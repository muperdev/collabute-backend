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
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  create(@Body() createIssueDto: CreateIssueDto, @Request() req: any) {
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
  @UseGuards(JwtAuthGuard)
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
    @Request() req: any,
  ) {
    return this.issuesService.update(id, updateIssueDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete issue' })
  @ApiResponse({ status: 200, description: 'Issue deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this issue',
  })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.issuesService.remove(id, req.user.id);
  }
}
