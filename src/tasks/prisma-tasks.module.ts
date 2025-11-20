import { Module } from '@nestjs/common';
import { PrismaTasksController } from './prisma-tasks.controller';
import { PrismaTasksService } from './prisma-tasks.service';

@Module({
  controllers: [PrismaTasksController],
  providers: [PrismaTasksService],
  exports: [PrismaTasksService],
})
export class PrismaTasksModule {}
