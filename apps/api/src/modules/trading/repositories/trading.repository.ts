import {
  GoldTradeSide,
  GoldTradeStatus,
  Prisma,
} from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

export interface CreateTradeOrderInput {
  orderNumber: string;
  userId: string;
  side: GoldTradeSide;
  symbol: string;
  karat: number;
  quantityGram: number;
  unitPriceToman: number;
  grossRial: number;
  commissionRial: number;
  netRial: number;
  commissionPercent: number;
  idempotencyKey: string;
}

@Injectable()
export class TradingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.goldTradeOrder.findUnique({
      where: { idempotencyKey },
      include: {
        walletTransaction: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findById(orderId: string) {
    return this.prisma.goldTradeOrder.findUnique({
      where: { id: orderId },
      include: {
        walletTransaction: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  createPending(input: CreateTradeOrderInput) {
    return this.prisma.goldTradeOrder.create({
      data: {
        orderNumber: input.orderNumber,
        userId: input.userId,
        side: input.side,
        status: GoldTradeStatus.PENDING,
        symbol: input.symbol,
        karat: input.karat,
        quantityGram: new Prisma.Decimal(input.quantityGram),
        unitPriceToman: new Prisma.Decimal(input.unitPriceToman),
        grossRial: new Prisma.Decimal(input.grossRial),
        commissionRial: new Prisma.Decimal(input.commissionRial),
        netRial: new Prisma.Decimal(input.netRial),
        commissionPercent: new Prisma.Decimal(input.commissionPercent),
        idempotencyKey: input.idempotencyKey,
      },
    });
  }

  markFilled(orderId: string, walletTransactionId: string) {
    return this.prisma.goldTradeOrder.update({
      where: { id: orderId },
      data: {
        status: GoldTradeStatus.FILLED,
        walletTransactionId,
        filledAt: new Date(),
        failureReason: null,
      },
      include: { walletTransaction: true },
    });
  }

  markFailed(orderId: string, failureReason: string) {
    return this.prisma.goldTradeOrder.update({
      where: { id: orderId },
      data: {
        status: GoldTradeStatus.FAILED,
        failureReason,
      },
    });
  }

  createAuditLog(
    orderId: string,
    action: string,
    actorId?: string,
    context?: Record<string, unknown>,
  ) {
    return this.prisma.goldTradeAuditLog.create({
      data: {
        orderId,
        actorId,
        action,
        context: context as Prisma.InputJsonValue | undefined,
      },
    });
  }

  listOrders(
    userId: string,
    skip: number,
    take: number,
    filters: { side?: GoldTradeSide; status?: GoldTradeStatus },
  ) {
    return this.prisma.goldTradeOrder.findMany({
      where: {
        userId,
        side: filters.side,
        status: filters.status,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countOrders(
    userId: string,
    filters: { side?: GoldTradeSide; status?: GoldTradeStatus },
  ) {
    return this.prisma.goldTradeOrder.count({
      where: {
        userId,
        side: filters.side,
        status: filters.status,
      },
    });
  }
}
