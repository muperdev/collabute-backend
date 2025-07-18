import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SeederService, PrismaService],
  exports: [SeederService],
})
export class SeederModule {}
