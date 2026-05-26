import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  findActiveRefreshTokens(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  revokeAllRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  createAuditLog(action: string, actorId: string) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
      },
    });
  }
}
