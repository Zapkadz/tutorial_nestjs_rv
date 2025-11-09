import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from './decorator/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  // TODO: Rate limit / Brute-force prevention - cân nhắc thêm cho production
  // Ví dụ: @UseGuards(ThrottlerGuard) hoặc custom rate limiting middleware
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  // TODO: Rate limit / Brute-force prevention - cân nhắc thêm cho production
  // Ví dụ: @UseGuards(ThrottlerGuard) hoặc custom rate limiting middleware
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@User() user) {
    return { user };
  }
}
