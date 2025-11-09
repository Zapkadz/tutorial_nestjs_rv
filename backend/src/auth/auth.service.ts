import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(`Registration attempt with existing email: ${dto.email}`);
      throw new ConflictException('Email already exists');
    }

    const saltRounds = process.env.BCRYPT_SALT ? +process.env.BCRYPT_SALT : 10;
    const hashed = await bcrypt.hash(dto.password, saltRounds);
    const user = await this.usersService.create({ ...dto, password: hashed });

    this.logger.log(`User registered successfully: ${dto.email}`);
    return this.buildUserResponse(user);
  }

  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      this.logger.warn(`Login attempt failed - user not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      this.logger.warn(`Login attempt failed - invalid password: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${dto.email}`);
    return this.buildUserResponse(user);
  }

  private buildUserResponse(user: any) {
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    // Bảo mật: đảm bảo không trả password trong response
    const { password, ...rest } = user;
    return { user: { ...rest, token } };
  }
}
