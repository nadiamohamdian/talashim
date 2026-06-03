import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@/generated/prisma';
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

  createUser(data: { email: string; fullName: string; passwordHash: string; role?: Role }) {
    return this.usersRepository.create(data);
  }

  updateStaffAccount(id: string, data: { role: Role; fullName?: string }) {
    return this.usersRepository.updateStaffAccount(id, data);
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
