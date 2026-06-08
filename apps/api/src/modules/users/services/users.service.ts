import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isValidIranNationalId } from '@sadafgold/shared';
import { Role } from '@/generated/prisma';
import { UsersRepository } from '../repositories/users.repository';
import type { UpdateProfileDto } from '../dto/update-profile.dto';

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

  async updateProfile(userId: string, payload: UpdateProfileDto) {
    const data: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      nationalId?: string;
      phone?: string;
    } = {};

    if (payload.firstName !== undefined) {
      data.firstName = payload.firstName.trim();
    }
    if (payload.lastName !== undefined) {
      data.lastName = payload.lastName.trim();
    }
    if (payload.nationalId !== undefined) {
      const nationalId = payload.nationalId.trim();
      if (!isValidIranNationalId(nationalId)) {
        throw new BadRequestException('Invalid national ID');
      }
      data.nationalId = nationalId;
    }
    if (payload.phone !== undefined) {
      data.phone = payload.phone.trim();
    }
    if (payload.fullName !== undefined && payload.firstName === undefined && payload.lastName === undefined) {
      data.fullName = payload.fullName.trim();
    } else if (payload.firstName !== undefined || payload.lastName !== undefined) {
      const current = await this.usersRepository.findById(userId);
      if (!current) {
        throw new NotFoundException('User not found');
      }
      const firstName = data.firstName ?? current.firstName ?? '';
      const lastName = data.lastName ?? current.lastName ?? '';
      const combined = `${firstName} ${lastName}`.trim();
      if (combined.length >= 2) {
        data.fullName = combined;
      }
    }

    const user = await this.usersRepository.updateProfile(userId, data);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
