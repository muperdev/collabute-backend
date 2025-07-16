import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectRepositoryDto {
  @ApiProperty({
    description: 'Full name of the GitHub repository (owner/repo)',
    example: 'owner/repository-name',
  })
  @IsString()
  repoFullName: string;
}
