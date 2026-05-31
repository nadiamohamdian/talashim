import {
  GoldTradeSide,
  KycStatus,
  Prisma,
  Role,
  WalletTransactionType,
} from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { userWalletAccountCode } from '@/modules/ledger/constants/system-accounts';
import { WalletAssetType } from '@/generated/prisma';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAnalytics() {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.PENDING } }),
      this.prisma.walletTransaction.count({
        where: { createdAt: { gte: since24h }, status: 'POSTED' },
      }),
      this.prisma.goldTradeOrder.count({
        where: { createdAt: { gte: since24h }, status: 'FILLED' },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { createdAt: { gte: since24h } },
      }),
      this.prisma.goldTradeOrder.groupBy({
        by: ['side'],
        _count: { id: true },
        where: { createdAt: { gte: since24h }, status: 'FILLED' },
      }),
    ]);
  }

  listUsers(skip: number, take: number, search?: string, role?: Role) {
    const where: Prisma.UserWhereInput = {
      role,
      OR: search
        ? [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          kycVerification: { select: { status: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  listKyc(skip: number, take: number, status?: KycStatus) {
    const where = { status };
    return Promise.all([
      this.prisma.kycVerification.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.kycVerification.count({ where }),
    ]);
  }

  reviewKyc(
    id: string,
    status: KycStatus,
    reviewerId: string,
    reviewNote?: string,
  ) {
    return this.prisma.kycVerification.update({
      where: { id },
      data: {
        status,
        reviewNote,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  listWalletTransactions(
    skip: number,
    take: number,
    type?: WalletTransactionType,
    userId?: string,
  ) {
    const where: Prisma.WalletTransactionWhereInput = { type, userId };
    return Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          entries: { include: { account: true } },
        },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);
  }

  listTradeOrders(
    skip: number,
    take: number,
    side?: GoldTradeSide,
    userId?: string,
  ) {
    const where = { side, userId };
    return Promise.all([
      this.prisma.goldTradeOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.goldTradeOrder.count({ where }),
    ]);
  }

  listWallets(skip: number, take: number, search?: string) {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, fullName: true, role: true },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  async getUserWalletSnapshot(userId: string) {
    const rialCode = userWalletAccountCode(userId, WalletAssetType.RIAL);
    const goldCode = userWalletAccountCode(userId, WalletAssetType.GOLD);

    const [rialAccount, goldAccount] = await Promise.all([
      this.prisma.ledgerAccount.findUnique({ where: { code: rialCode } }),
      this.prisma.ledgerAccount.findUnique({ where: { code: goldCode } }),
    ]);

    const sumBalance = async (accountId: string | undefined) => {
      if (!accountId) return '0';
      const entries = await this.prisma.ledgerEntry.findMany({
        where: { accountId },
        include: { account: true },
      });
      const balance = entries.reduce((total, entry) => {
        const amount = Number(entry.amount);
        const isAsset =
          entry.account.category === 'ASSET' || entry.account.category === 'EXPENSE';
        const delta = isAsset
          ? entry.side === 'DEBIT'
            ? amount
            : -amount
          : entry.side === 'CREDIT'
            ? amount
            : -amount;
        return total + delta;
      }, 0);
      return balance.toString();
    };

    return {
      rialBalance: await sumBalance(rialAccount?.id),
      goldBalanceGram: await sumBalance(goldAccount?.id),
    };
  }

  async listAuditLogs(
    skip: number,
    take: number,
    source?: 'platform' | 'wallet' | 'trade',
  ) {
    if (source === 'wallet') {
      const [items, total] = await Promise.all([
        this.prisma.walletAuditLog.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, email: true, fullName: true } } },
        }),
        this.prisma.walletAuditLog.count(),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          source: 'wallet' as const,
          action: item.action,
          actorId: item.actorId,
          actor: item.actor,
          context: item.context,
          createdAt: item.createdAt,
        })),
        total,
      };
    }

    if (source === 'trade') {
      const [items, total] = await Promise.all([
        this.prisma.goldTradeAuditLog.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, email: true, fullName: true } } },
        }),
        this.prisma.goldTradeAuditLog.count(),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          source: 'trade' as const,
          action: item.action,
          actorId: item.actorId,
          actor: item.actor,
          context: item.context,
          createdAt: item.createdAt,
        })),
        total,
      };
    }

    const [platformItems, walletItems, tradeItems] = await Promise.all([
      this.prisma.auditLog.findMany({
        take: take + skip,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true, fullName: true } } },
      }),
      this.prisma.walletAuditLog.findMany({
        take: take + skip,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true, fullName: true } } },
      }),
      this.prisma.goldTradeAuditLog.findMany({
        take: take + skip,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true, fullName: true } } },
      }),
    ]);

    const merged = [
      ...platformItems.map((item) => ({
        id: item.id,
        source: 'platform' as const,
        action: item.action,
        actorId: item.actorId,
        actor: item.actor,
        context: item.context,
        createdAt: item.createdAt,
      })),
      ...walletItems.map((item) => ({
        id: item.id,
        source: 'wallet' as const,
        action: item.action,
        actorId: item.actorId,
        actor: item.actor,
        context: item.context,
        createdAt: item.createdAt,
      })),
      ...tradeItems.map((item) => ({
        id: item.id,
        source: 'trade' as const,
        action: item.action,
        actorId: item.actorId,
        actor: item.actor,
        context: item.context,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + take);

    const [platformTotal, walletTotal, tradeTotal] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.walletAuditLog.count(),
      this.prisma.goldTradeAuditLog.count(),
    ]);

    return { items: merged, total: platformTotal + walletTotal + tradeTotal };
  }

  createAuditLog(action: string, actorId: string, context?: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: {
        action,
        actorId,
        context: context as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
