import {
  GoldTradeSide,
  KycStatus,
  PaymentStatus,
  Prisma,
  Role,
  WalletTransactionStatus,
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
      this.prisma.user.count({ where: { role: { not: Role.CUSTOMER } } }),
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

  listUsers(skip: number, take: number, search?: string, role?: Role, staffOnly?: boolean) {
    const where: Prisma.UserWhereInput = {
      role: role ?? (staffOnly ? { not: Role.CUSTOMER } : undefined),
      OR: search
        ? [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
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
          phone: true,
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

  createStaffUser(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    role: Role;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  updateStaffUser(
    userId: string,
    data: { email?: string; fullName?: string; passwordHash?: string; role?: Role },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  findStaffUserById(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, role: { not: Role.CUSTOMER } },
      select: { id: true, email: true, fullName: true, role: true },
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
    status?: WalletTransactionStatus,
    hasReceipt?: boolean,
    hasWithdrawalRequest?: boolean,
  ) {
    const where: Prisma.WalletTransactionWhereInput = { type, userId, status };
    const metadataFilters: Prisma.WalletTransactionWhereInput[] = [];
    if (hasReceipt) {
      metadataFilters.push({
        metadata: { path: ['receiptUrl'], not: Prisma.AnyNull },
      });
    }
    if (hasWithdrawalRequest) {
      metadataFilters.push({
        metadata: { path: ['iban'], not: Prisma.AnyNull },
      });
    }
    if (metadataFilters.length > 0) {
      where.AND = metadataFilters;
    }
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

  listPaymentReceipts(skip: number, take: number, status?: PaymentStatus) {
    const where: Prisma.PaymentWhereInput = {
      receiptUrl: { not: null },
    };
    if (status) {
      where.status = status;
    }

    return Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: [{ receiptUploadedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
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

  listSessions(
    skip: number,
    take: number,
    search?: string,
    status: 'active' | 'revoked' | 'expired' | 'all' = 'all',
  ) {
    const now = new Date();
    const where: Prisma.RefreshTokenWhereInput = {
      ...(search
        ? {
            user: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      ...(status === 'active'
        ? { revokedAt: null, expiresAt: { gt: now } }
        : status === 'revoked'
          ? { revokedAt: { not: null } }
          : status === 'expired'
            ? { revokedAt: null, expiresAt: { lte: now } }
            : {}),
    };

    return Promise.all([
      this.prisma.refreshToken.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true },
          },
        },
      }),
      this.prisma.refreshToken.count({ where }),
    ]);
  }

  revokeSession(sessionId: string) {
    return this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllUserSessions(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  listLoginHistory(skip: number, take: number, search?: string, action?: string) {
    const where: Prisma.AuditLogWhereInput = {
      action: action ? { equals: action } : { startsWith: 'auth.' },
      ...(search
        ? {
            actor: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    return Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true, fullName: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
  }

  findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            recipient: true,
            phone: true,
            line1: true,
            city: true,
            state: true,
            postalCode: true,
            createdAt: true,
          },
        },
        kycVerification: {
          select: {
            id: true,
            status: true,
            nationalId: true,
            phone: true,
            submittedAt: true,
            reviewNote: true,
          },
        },
      },
    });
  }

  findKycByPhoneForOtherUser(phone: string, userId: string) {
    return this.prisma.kycVerification.findFirst({
      where: { phone, userId: { not: userId } },
      select: { id: true, userId: true },
    });
  }

  updateKycPhone(userId: string, phone: string) {
    return this.prisma.kycVerification.update({
      where: { userId },
      data: { phone },
    });
  }

  createKycForUser(userId: string, data: { phone: string; nationalId: string }) {
    return this.prisma.kycVerification.create({
      data: {
        userId,
        phone: data.phone,
        nationalId: data.nationalId,
        status: KycStatus.PENDING,
      },
    });
  }

  findUserAddressById(userId: string, addressId: string) {
    return this.prisma.address.findFirst({ where: { id: addressId, userId } });
  }

  findPrimaryUserAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  createUserAddress(
    userId: string,
    data: {
      title: string;
      recipient: string;
      phone: string;
      line1: string;
      city: string;
      state: string;
      postalCode: string;
    },
  ) {
    return this.prisma.address.create({ data: { userId, ...data } });
  }

  updateUserAddress(
    addressId: string,
    data: {
      title: string;
      recipient: string;
      phone: string;
      line1: string;
      city: string;
      state: string;
      postalCode: string;
    },
  ) {
    return this.prisma.address.update({ where: { id: addressId }, data });
  }

  getUserOrderStats(userId: string) {
    return Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.goldTradeOrder.count({ where: { userId } }),
    ]);
  }

  getUserRecentOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, orderNumber: true, status: true, totalToman: true },
    });
  }

  getUserRecentWalletTransactions(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, type: true, reference: true },
    });
  }

  getUserRecentTrades(userId: string) {
    return this.prisma.goldTradeOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, orderNumber: true, side: true, quantityGram: true },
    });
  }

  listUserActivity(userId: string, skip: number, take: number) {
    const actorFilter = { actorId: userId };
    const windowSize = skip + take;
    return Promise.all([
      this.prisma.auditLog.findMany({
        where: actorFilter,
        skip: 0,
        take: windowSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, action: true, context: true, createdAt: true },
      }),
      this.prisma.auditLog.count({ where: actorFilter }),
    ]).then(async ([platformItems, platformTotal]) => {
      const [walletItems, walletTotal] = await Promise.all([
        this.prisma.walletAuditLog.findMany({
          where: actorFilter,
          skip: 0,
          take: windowSize,
          orderBy: { createdAt: 'desc' },
          select: { id: true, action: true, context: true, createdAt: true },
        }),
        this.prisma.walletAuditLog.count({ where: actorFilter }),
      ]);
      const [tradeItems, tradeTotal] = await Promise.all([
        this.prisma.goldTradeAuditLog.findMany({
          where: actorFilter,
          skip: 0,
          take: windowSize,
          orderBy: { createdAt: 'desc' },
          select: { id: true, action: true, context: true, createdAt: true },
        }),
        this.prisma.goldTradeAuditLog.count({ where: actorFilter }),
      ]);

      const merged = [
        ...platformItems.map((item) => ({ ...item, source: 'platform' as const })),
        ...walletItems.map((item) => ({ ...item, source: 'wallet' as const })),
        ...tradeItems.map((item) => ({ ...item, source: 'trade' as const })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + take);

      return [merged, platformTotal + walletTotal + tradeTotal] as const;
    });
  }
}
