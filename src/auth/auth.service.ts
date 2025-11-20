import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Регистрация пользователя
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Проверяем существование пользователя
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким username или email уже существует',
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя с ролью по умолчанию 'user'
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roles: ['user'], // Простой массив строк
      },
    });

    // Убираем пароль из ответа
    const { password: _, ...result } = user;
    return result;
  }

  // Валидация пользователя для LocalStrategy
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  // Логин пользователя
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles, // Простой массив строк
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  // Получение пользователя по ID
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const { password: _, ...result } = user;
    return result;
  }
}
