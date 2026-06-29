import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { isValidIranNationalId, normalizeIranMobile } from '@sadafgold/shared';
import { Role } from '@/generated/prisma';
import { UsersRepository } from '../repositories/users.repository';
import type { ChangePasswordDto } from '../dto/change-password.dto';
import type { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findByPhone(phone: string) {
    const normalized = normalizeIranMobile(phone);
    if (!normalized) {
      return null;
    }
    return this.usersRepository.findByPhone(normalized);
  }

  async assertPhoneAvailable(phone: string, excludeUserId?: string) {
    const normalized = normalizeIranMobile(phone);
    if (!normalized) {
      throw new BadRequestException('شماره موبایل معتبر نیست');
    }

    const existing = await this.usersRepository.findByPhone(normalized);
    if (existing && existing.id !== excludeUserId) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    return normalized;
  }

  async ensurePhoneFromAddress(userId: string, addressPhone: string) {
    const normalized = normalizeIranMobile(addressPhone);
    if (!normalized) {
      return;
    }

    const user = await this.usersRepository.findById(userId);
    if (!user || user.phone) {
      return;
    }

    await this.assertPhoneAvailable(normalized, userId);
    await this.usersRepository.updateProfile(userId, { phone: normalized });
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  createUser(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    phone?: string;
    requiresPasswordSetup?: boolean;
    role?: Role;
  }) {
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
      data.phone = await this.assertPhoneAvailable(payload.phone, userId);
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

  async changePassword(userId: string, payload: ChangePasswordDto) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.requiresPasswordSetup) {
      if (!payload.currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const passwordMatches = await argon2.verify(user.passwordHash, payload.currentPassword);
      if (!passwordMatches) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const passwordHash = await argon2.hash(payload.newPassword);
    await this.usersRepository.updatePassword(userId, passwordHash, false);

    return { success: true };
  }
}
