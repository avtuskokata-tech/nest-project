import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles, // Просто массив строк для упрощенной версии
    };
  }
}
