import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaTasksService } from './prisma-tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('prisma/tasks')
@UseGuards(JwtAuthGuard) // ЗАЩИТА ВСЕХ ЭНДПОИНТОВ
export class PrismaTasksController {
  constructor(private readonly tasksService: PrismaTasksService) {}

  @Get()
  async findAll(@Request() req) {
    console.log('User from request:', req.user); // Для отладки
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    // Автоматически привязываем задачу к текущему пользователю
    return this.tasksService.createForUser(req.user.id, createTaskDto);
  }

  @Post('user/:userId')
  async createForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.createForUser(userId, createTaskDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Put(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.completeTask(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }

  @Get('user/:userId')
  async findTasksByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.tasksService.findTasksByUser(userId);
  }

  // Новый эндпоинт для получения задач текущего пользователя
  @Get('my/tasks')
  async findMyTasks(@Request() req) {
    return this.tasksService.findTasksByUser(req.user.id);
  }
}
