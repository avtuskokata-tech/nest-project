import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        // Исключаем пароль из ответа
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении пользователей',
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        // Исключаем пароль из ответа
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${id} не найден`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении пользователя',
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Генерируем временный пароль
      const temporaryPassword = await bcrypt.hash('temporary123', 10);

      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: temporaryPassword, // Добавляем обязательное поле
          roles: ['user'], // Роль по умолчанию
        },
        // Исключаем пароль из ответа
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким username или email уже существует',
        );
      }
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.findOne(id); // Проверяем существование пользователя

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        // Исключаем пароль из ответа
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким username или email уже существует',
        );
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении пользователя',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id); // Проверяем существование пользователя

      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении пользователя',
      );
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        // Исключаем пароль из ответа
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `Пользователь с username ${username} не найден`,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при поиске пользователя по username',
      );
    }
  }

  // Метод для поиска пользователя с паролем (только для аутентификации)
  async findByUsernameWithPassword(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
