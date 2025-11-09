import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'devSecret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // payload có id/email, lấy user từ DB để attach vào request
    const user = await this.usersService.findById(payload.id);
    if (!user) return null;
    // loại bỏ password và return user — sẽ đẩy vào request.user
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }
}

