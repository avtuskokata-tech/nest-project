import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrismaTasksModule } from './tasks/prisma-tasks.module';
import { PrismaUsersModule } from './users/prisma-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    PrismaTasksModule,
    PrismaUsersModule,
  ],
})
export class AppModule {}
