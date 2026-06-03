import { Injectable } from '@nestjs/common';
import { Role } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { email: string; fullName: string; passwordHash: string; role?: Role }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.CUSTOMER,
      },
    });
  }

  updateStaffAccount(id: string, data: { role: Role; fullName?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: data.role,
        fullName: data.fullName,
      },
    });
  }

  findProfileById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        kycVerification: { select: { status: true } },
      },
    }).then((user) => {
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
        kycStatus: user.kycVerification?.status.toLowerCase() ?? 'none',
      };
    });
  }

  updateProfile(id: string, data: { fullName?: string }) {
    return this.prisma.user
      .update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          kycVerification: { select: { status: true } },
        },
      })
      .then((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
        kycStatus: user.kycVerification?.status.toLowerCase() ?? 'none',
      }));
  }
}
