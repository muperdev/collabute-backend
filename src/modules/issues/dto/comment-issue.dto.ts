import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CommentIssueDto {
  @ApiProperty({ example: 'This is a comment on the issue' })
  @IsString()
  @MinLength(1)
  content: string;
}
