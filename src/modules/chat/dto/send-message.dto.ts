import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello everyone!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'conversation-uuid' })
  @IsUUID()
  conversationId: string;

  @ApiPropertyOptional({ example: 'message-uuid' })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
