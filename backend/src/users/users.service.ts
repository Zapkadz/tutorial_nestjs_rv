import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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

  async create(payload: Partial<User>) {
    // check duplicate email in DB
    const exists = await this.usersRepository.findOne({ where: { email: payload.email } });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    // hash password before save (important)
    const hashedPassword = await bcrypt.hash(payload.password ?? '', 10);

    const newUser = this.usersRepository.create({
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      bio: payload.bio,
    });

    const saved = await this.usersRepository.save(newUser);
    return this.removePassword(saved);
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
}
