import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsNumber,
} from 'class-validator';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum IssueType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IssueCategory {
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  APPLICATION = 'APPLICATION',
  AI = 'AI',
  DATA = 'DATA',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  DEVOPS = 'DEVOPS',
  SECURITY = 'SECURITY',
  DATABASE = 'DATABASE',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  DOCUMENTATION = 'DOCUMENTATION',
  SEO = 'SEO',
}

export class CreateIssueDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Users cannot login with their credentials' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Detailed description of the issue...' })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ enum: IssueType, example: IssueType.BUG })
  @IsEnum(IssueType)
  type: IssueType;

  @ApiPropertyOptional({
    enum: IssueCategory,
    isArray: true,
    example: [IssueCategory.FRONTEND],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(IssueCategory, { each: true })
  category?: IssueCategory[];

  @ApiProperty({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ enum: IssueStatus, example: IssueStatus.OPEN })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus = IssueStatus.OPEN;

  @ApiProperty({ example: 'project-uuid' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['user-uuid-1', 'user-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds?: string[];

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ type: [String], example: ['bug', 'frontend'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}
