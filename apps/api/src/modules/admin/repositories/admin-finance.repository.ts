import { Injectable } from '@nestjs/common';
import {
  LedgerAccountCategory,
  Prisma,
  WalletTransactionStatus,
} from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { accountBalanceDelta } from '@/modules/ledger/constants/system-accounts';

@Injectable()
export class AdminFinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  listLedgerEntries(
    skip: number,
    take: number,
    filters: {
      search?: string;
      accountCode?: string;
      userId?: string;
      transactionId?: string;
      assetType?: string;
      side?: string;
      from?: Date;
      to?: Date;
    },
  ) {
    const where: Prisma.LedgerEntryWhereInput = {};

    if (filters.assetType) {
      where.assetType =
        filters.assetType as Prisma.EnumWalletAssetTypeFilter['equals'];
    }

    if (filters.side) {
      where.side = filters.side as Prisma.EnumLedgerSideFilter['equals'];
    }

    if (filters.transactionId) {
      where.transactionId = filters.transactionId;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = filters.from;
      }
      if (filters.to) {
        where.createdAt.lte = filters.to;
      }
    }

    if (filters.accountCode || filters.userId) {
      where.account = {
        ...(filters.accountCode
          ? { code: { contains: filters.accountCode, mode: 'insensitive' } }
          : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
      };
    }

    if (filters.search?.trim()) {
      where.OR = [
        {
          account: {
            code: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
        {
          account: {
            name: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
        {
          transaction: {
            reference: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.ledgerEntry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          account: {
            include: {
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
          transaction: {
            include: {
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
        },
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);
  }

  listLedgerAccounts(
    skip: number,
    take: number,
    filters: {
      search?: string;
      category?: LedgerAccountCategory;
      userId?: string;
    },
  ) {
    const where: Prisma.LedgerAccountWhereInput = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search?.trim()) {
      where.OR = [
        { code: { contains: filters.search.trim(), mode: 'insensitive' } },
        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.ledgerAccount.findMany({
        where,
        skip,
        take,
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          entries: {
            select: {
              side: true,
              amount: true,
              account: { select: { category: true } },
            },
          },
        },
      }),
      this.prisma.ledgerAccount.count({ where }),
    ]);
  }

  listAllAccountsForSummary(category?: LedgerAccountCategory) {
    return this.prisma.ledgerAccount.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        entries: { select: { side: true, amount: true } },
      },
    });
  }

  computeAccountBalance(
    category: LedgerAccountCategory,
    entries: Array<{ side: string; amount: Prisma.Decimal }>,
  ): string {
    const balance = entries.reduce((total, entry) => {
      return (
        total +
        accountBalanceDelta(
          category,
          entry.side as 'DEBIT' | 'CREDIT',
          Number(entry.amount),
        )
      );
    }, 0);
    return balance.toFixed(6);
  }

  getFinancePeriodStats(from?: Date, to?: Date) {
    const dateWhere: Prisma.WalletTransactionWhereInput = {};
    if (from || to) {
      dateWhere.createdAt = {};
      if (from) {
        dateWhere.createdAt.gte = from;
      }
      if (to) {
        dateWhere.createdAt.lte = to;
      }
    }

    return Promise.all([
      this.prisma.walletTransaction.count({ where: dateWhere }),
      this.prisma.walletTransaction.count({
        where: { ...dateWhere, status: WalletTransactionStatus.POSTED },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['type'],
        where: dateWhere,
        _count: { _all: true },
      }),
      this.buildDailyTxSeries(from, to),
      this.prisma.goldTradeOrder.aggregate({
        where: {
          status: 'FILLED',
          ...(from || to
            ? {
                filledAt: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        },
        _sum: { netRial: true, commissionRial: true },
        _count: { _all: true },
      }),
    ]);
  }

  private async buildDailyTxSeries(from?: Date, to?: Date) {
    const end = to ?? new Date();
    const start = from ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const points: Array<{ label: string; value: number }> = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.prisma.walletTransaction.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      });

      points.push({
        label: dayStart.toISOString().slice(0, 10),
        value: count,
      });
    }

    return points;
  }
}
