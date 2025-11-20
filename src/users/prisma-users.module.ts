import { Module } from '@nestjs/common';
import { PrismaUsersController } from './prisma-users.controller';
import { PrismaUsersService } from './prisma-users.service';

@Module({
  controllers: [PrismaUsersController],
  providers: [PrismaUsersService],
  exports: [PrismaUsersService],
})
export class PrismaUsersModule {}
