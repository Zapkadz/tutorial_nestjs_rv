import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async removePassword(user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }

  async create(createDto: CreateUserDto) {
    // Nếu password đã được hash (bắt đầu bằng $2b$), không hash lại
    const password = createDto.password.startsWith('$2b$')
      ? createDto.password
      : await bcrypt.hash(
          createDto.password,
          process.env.BCRYPT_SALT ? +process.env.BCRYPT_SALT : 10,
        );
    const user = this.usersRepository.create({ ...createDto, password });
    return this.usersRepository.save(user);
  }

  async findAll() {
    const list = await this.usersRepository.find();
    return list.map(u => {
      const { password, ...rest } = u as any;
      return rest;
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.removePassword(user);
  }

  async update(id: number, payload: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (payload.email && payload.email !== user.email) {
      const exists = await this.usersRepository.findOne({ where: { email: payload.email } });
      if (exists) throw new ConflictException('Email already exists');
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const updated = Object.assign(user, payload);
    const saved = await this.usersRepository.save(updated);
    return this.removePassword(saved);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.remove(user);
    return { deleted: true };
  }

  // (tùy chọn) helper to find by email (dùng cho auth)
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }
}
