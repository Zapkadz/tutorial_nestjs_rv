import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  bio?: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  create(payload: Omit<User, 'id'>) {
    // check duplicate email
    if (this.users.some(u => u.email === payload.email)) {
      throw new ConflictException('Email already exists');
    }
    const newUser: User = { id: this.nextId++, ...payload };
    this.users.push(newUser);
    const { password, ...rest } = newUser;
    return rest;
  }

  findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  update(id: number, payload: Partial<Omit<User, 'id'>>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    this.users[idx] = { ...this.users[idx], ...payload };
    const { password, ...rest } = this.users[idx];
    return rest;
  }

  remove(id: number) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    this.users.splice(idx, 1);
    return { deleted: true };
  }
}
