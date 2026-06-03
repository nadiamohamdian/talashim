import { Injectable } from '@nestjs/common';
import { GoldTradeSide, GoldTradeStatus, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AdminTradingRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders(
    skip: number,
    take: number,
    filters: {
      side?: GoldTradeSide;
      status?: GoldTradeStatus;
      userId?: string;
      search?: string;
      from?: Date;
      to?: Date;
    },
  ) {
    const where: Prisma.GoldTradeOrderWhereInput = {};

    if (filters.side) {
      where.side = filters.side;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.userId) {
      where.userId = filters.userId;
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
    if (filters.search?.trim()) {
      where.OR = [
        { orderNumber: { contains: filters.search.trim(), mode: 'insensitive' } },
        { user: { email: { contains: filters.search.trim(), mode: 'insensitive' } } },
        { user: { fullName: { contains: filters.search.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.$transaction([
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

  findOrderById(id: string) {
    return this.prisma.goldTradeOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        walletTransaction: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  getSettlementSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return Promise.all([
      this.prisma.goldTradeOrder.count({ where: { status: GoldTradeStatus.PENDING } }),
      this.prisma.goldTradeOrder.count({ where: { status: GoldTradeStatus.FAILED } }),
      this.prisma.goldTradeOrder.count({
        where: {
          status: GoldTradeStatus.FILLED,
          filledAt: { gte: startOfDay },
        },
      }),
    ]);
  }
}
