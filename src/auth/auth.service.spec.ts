import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        ...registerDto,
        password: 'hashedPassword',
        roles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result.username).toBe(registerDto.username);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if user exists', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 1,
        username: 'testuser',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
