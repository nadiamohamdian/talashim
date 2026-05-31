import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  createUser(data: { email: string; fullName: string; passwordHash: string }) {
    return this.usersRepository.create(data);
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findProfileById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, payload: { fullName?: string }) {
    const user = await this.usersRepository.updateProfile(userId, payload);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
