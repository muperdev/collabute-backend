import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';

export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
  PROJECT = 'PROJECT',
}

export class CreateConversationDto {
  @ApiProperty({ example: 'Project Discussion' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ConversationType, example: ConversationType.PROJECT })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiPropertyOptional({ example: 'project-uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['user-uuid-1', 'user-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
