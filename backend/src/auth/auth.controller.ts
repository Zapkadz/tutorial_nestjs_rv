import { Controller, Post, Body, Get, UseGuards, Put, Header } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from './decorator/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginRateLimitGuard } from './guard/login-rate-limit.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async createUserAccount(@Body() body: { user: RegisterUserDto }) {
    return this.authService.register(body.user);
  }

  @Post('users/login')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @UseGuards(LoginRateLimitGuard)
  async loginUserAccount(@Body() body: { user: LoginUserDto }) {
    return this.authService.login(body.user);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  getCurrentUser(@User() user) {
    return this.authService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async updateCurrentUser(@User('id') userId: number, @Body() body: { user: UpdateUserDto }) {
    return this.authService.updateUser(userId, body.user);
  }
}
