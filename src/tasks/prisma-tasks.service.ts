import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class PrismaTasksService {
  constructor(private prisma: PrismaService) {}

  // Получить все задачи
  async findAll() {
    return this.prisma.task.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Получить задачу по ID
  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`);
    }

    return task;
  }

  // Создать задачу
  async create(createTaskDto: CreateTaskDto) {
    try {
      return await this.prisma.task.create({
        data: createTaskDto,
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Задача с таким названием уже существует');
      }
      throw error;
    }
  }

  // Создать задачу для пользователя
  async createForUser(userId: number, createTaskDto: CreateTaskDto) {
    try {
      // Проверяем существование пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return await this.prisma.task.create({
        data: {
          ...createTaskDto,
          userId,
        },
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Задача с таким названием уже существует');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Пользователь не найден');
      }
      throw error;
    }
  }

  // Обновить задачу
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: updateTaskDto,
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Задача с ID ${id} не найдена`);
      }
      throw error;
    }
  }

  // Удалить задачу
  async remove(id: number) {
    try {
      await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Задача с ID ${id} не найдена`);
      }
      throw error;
    }
  }

  // Получить задачи пользователя
  async findTasksByUser(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Отметить задачу как выполненную
  async completeTask(id: number) {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: { completed: true },
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Задача с ID ${id} не найдена`);
      }
      throw error;
    }
  }
}
