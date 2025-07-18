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
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import {
  createIssueDecorator,
  findAllIssuesDecorator,
  findIssueByIdDecorator,
  updateIssueDecorator,
  deleteIssueDecorator,
} from './decorators/response.decorator';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @createIssueDecorator()
  create(@Body() createIssueDto: CreateIssueDto, @RequestDecorator() req: any) {
    return this.issuesService.create(createIssueDto, req.user.id);
  }

  @Get()
  @findAllIssuesDecorator()
  findAll(@Query() query: any) {
    return this.issuesService.findAll(query);
  }

  @Get(':id')
  @findIssueByIdDecorator()
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  @updateIssueDecorator()
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @RequestDecorator() req: any,
  ) {
    return this.issuesService.update(id, updateIssueDto, req.user.id);
  }

  @Delete(':id')
  @deleteIssueDecorator()
  remove(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.issuesService.remove(id, req.user.id);
  }
}
