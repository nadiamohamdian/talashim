import { Injectable } from '@nestjs/common';
import { Role } from '@/generated/prisma';
import { normalizeIranMobile } from '@sadafgold/shared';
import { PrismaService } from '@/infrastructure/database/prisma.service';

const profileSelect = {
  id: true,
  email: true,
  fullName: true,
  firstName: true,
  lastName: true,
  nationalId: true,
  phone: true,
  requiresPasswordSetup: true,
  role: true,
  createdAt: true,
  kycVerification: { select: { status: true } },
} as const;

function mapProfile(user: {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  nationalId: string | null;
  phone: string | null;
  requiresPasswordSetup: boolean;
  role: Role;
  createdAt: Date;
  kycVerification: { status: string } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    nationalId: user.nationalId,
    phone: user.phone,
    requiresPasswordSetup: user.requiresPasswordSetup,
    role: user.role.toLowerCase(),
    createdAt: user.createdAt.toISOString(),
    kycStatus: user.kycVerification?.status.toLowerCase() ?? 'none',
  };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  findByPhoneForOtherUser(phone: string, userId: string) {
    return this.prisma.user.findFirst({
      where: { phone, id: { not: userId } },
      select: { id: true },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    phone?: string;
    requiresPasswordSetup?: boolean;
    role?: Role;
  }) {
    const phone = data.phone ? normalizeIranMobile(data.phone) ?? undefined : undefined;
    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        phone,
        requiresPasswordSetup: data.requiresPasswordSetup ?? false,
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
    return this.prisma.user
      .findUnique({
        where: { id },
        select: profileSelect,
      })
      .then((user) => (user ? mapProfile(user) : null));
  }

  updateProfile(
    id: string,
    data: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      nationalId?: string;
      phone?: string;
    },
  ) {
    return this.prisma.user
      .update({
        where: { id },
        data,
        select: profileSelect,
      })
      .then(mapProfile);
  }

  updatePassword(id: string, passwordHash: string, requiresPasswordSetup: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, requiresPasswordSetup },
    });
  }
}
