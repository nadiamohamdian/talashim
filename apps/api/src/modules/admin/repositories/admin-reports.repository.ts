import {
  GoldTradeSide,
  GoldTradeStatus,
  KycStatus,
  OrderStatus,
  Prisma,
  ProductCategory,
  Role,
  WalletTransactionType,
} from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { tomanBigIntToNumber } from '@/common/finance/toman-amount';

const LOW_STOCK_THRESHOLD = 2;
const DAILY_SERIES_DAYS = 14;

function createdAtRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
  if (!from && !to) {
    return undefined;
  }
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}

function defaultFromDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class AdminReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private resolveRange(from?: string, to?: string) {
    const fromDate = from ? new Date(from) : defaultFromDate();
    const toDate = to ? new Date(to) : new Date();
    return { fromDate, toDate };
  }

  async getSalesSummary(from?: string, to?: string) {
    const { fromDate, toDate } = this.resolveRange(from, to);
    const dateWhere = { createdAt: { gte: fromDate, lte: toDate } };

    const revenueStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
    ];

    const [
      orderCount,
      revenueAgg,
      allCount,
      byStatus,
      dailySeries,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { ...dateWhere, status: { in: revenueStatuses } },
      }),
      this.prisma.order.aggregate({
        where: { ...dateWhere, status: { in: revenueStatuses } },
        _sum: { totalToman: true },
      }),
      this.prisma.order.count({ where: dateWhere }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: dateWhere,
        _count: { id: true },
        _sum: { totalToman: true },
      }),
      this.buildOrderDailySeries(fromDate, toDate),
    ]);

    const totalRevenue = tomanBigIntToNumber(revenueAgg._sum.totalToman ?? 0n);
    const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    return {
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      orderCount,
      allCount,
      totalRevenue,
      avgOrder,
      byStatus: byStatus.map((row) => ({
        key: row.status,
        label: row.status,
        count: row._count.id,
        amount: tomanBigIntToNumber(row._sum.totalToman ?? 0n),
      })),
      dailySeries,
    };
  }

  listSalesOrders(
    skip: number,
    take: number,
    from?: string,
    to?: string,
    status?: OrderStatus,
  ) {
    const createdAt = createdAtRange(from, to);
    const where: Prisma.OrderWhereInput = {
      ...(createdAt ? { createdAt } : {}),
      ...(status ? { status } : {}),
    };

    return Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  async getInventorySummary() {
    const items = await this.prisma.inventoryItem.findMany({
      include: {
        product: { select: { category: true } },
      },
    });

    let totalUnits = 0;
    let totalReserved = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryMap = new Map<string, { count: number; units: number }>();

    for (const item of items) {
      const available = item.quantity - item.reserved;
      totalUnits += item.quantity;
      totalReserved += item.reserved;
      if (available <= 0) {
        outOfStockCount += 1;
      } else if (available <= LOW_STOCK_THRESHOLD) {
        lowStockCount += 1;
      }

      const cat = item.product.category;
      const prev = categoryMap.get(cat) ?? { count: 0, units: 0 };
      categoryMap.set(cat, {
        count: prev.count + 1,
        units: prev.units + item.quantity,
      });
    }

    const productCount = await this.prisma.product.count();

    return {
      productCount,
      skuWithInventory: items.length,
      totalUnits,
      totalReserved,
      availableUnits: totalUnits - totalReserved,
      lowStockCount,
      outOfStockCount,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      byCategory: Array.from(categoryMap.entries()).map(([key, val]) => ({
        key,
        label: key,
        count: val.count,
        amount: val.units,
      })),
    };
  }

  listInventory(
    skip: number,
    take: number,
    category?: ProductCategory,
    search?: string,
    lowStockOnly?: boolean,
  ) {
    const where: Prisma.ProductWhereInput = {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { sku: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      inventoryItem: lowStockOnly
        ? {
            quantity: { lte: LOW_STOCK_THRESHOLD + 10 },
          }
        : { isNot: null },
    };

    return Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { title: 'asc' },
        include: { inventoryItem: true },
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  async getUsersSummary(from?: string, to?: string) {
    const { fromDate, toDate } = this.resolveRange(from, to);
    const dateWhere = { createdAt: { gte: fromDate, lte: toDate } };

    const [
      totalUsers,
      newUsers,
      byRole,
      kycPending,
      kycApproved,
      kycRejected,
      registrationSeries,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: dateWhere }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.PENDING } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.APPROVED } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.REJECTED } }),
      this.buildUserDailySeries(fromDate, toDate),
    ]);

    const customers =
      byRole.find((r) => r.role === Role.CUSTOMER)?._count.id ?? 0;
    const staff = totalUsers - customers;

    return {
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      totalUsers,
      newUsers,
      customers,
      staff,
      kycPending,
      kycApproved,
      kycRejected,
      byRole: byRole.map((row) => ({
        key: row.role,
        label: row.role,
        count: row._count.id,
      })),
      registrationSeries,
    };
  }

  listUsersReport(
    skip: number,
    take: number,
    from?: string,
    to?: string,
    role?: Role,
    search?: string,
  ) {
    const createdAt = createdAtRange(from, to);
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(createdAt ? { createdAt } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
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
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  async getTradingSummary(from?: string, to?: string) {
    const { fromDate, toDate } = this.resolveRange(from, to);
    const dateWhere = { createdAt: { gte: fromDate, lte: toDate } };

    const [total, filled, bySide, byStatus, commissionAgg, dailySeries] =
      await Promise.all([
        this.prisma.goldTradeOrder.count({ where: dateWhere }),
        this.prisma.goldTradeOrder.count({
          where: { ...dateWhere, status: GoldTradeStatus.FILLED },
        }),
        this.prisma.goldTradeOrder.groupBy({
          by: ['side'],
          where: { ...dateWhere, status: GoldTradeStatus.FILLED },
          _count: { id: true },
          _sum: { netRial: true, quantityGram: true },
        }),
        this.prisma.goldTradeOrder.groupBy({
          by: ['status'],
          where: dateWhere,
          _count: { id: true },
        }),
        this.prisma.goldTradeOrder.aggregate({
          where: { ...dateWhere, status: GoldTradeStatus.FILLED },
          _sum: { commissionRial: true, netRial: true, quantityGram: true },
        }),
        this.buildTradeDailySeries(fromDate, toDate),
      ]);

    return {
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      total,
      filled,
      commissionTotal: commissionAgg._sum.commissionRial?.toString() ?? '0',
      netRialTotal: commissionAgg._sum.netRial?.toString() ?? '0',
      volumeGram: commissionAgg._sum.quantityGram?.toString() ?? '0',
      bySide: bySide.map((row) => ({
        key: row.side,
        label: row.side,
        count: row._count.id,
        amount: Number(row._sum.netRial ?? 0),
      })),
      byStatus: byStatus.map((row) => ({
        key: row.status,
        label: row.status,
        count: row._count.id,
      })),
      dailySeries,
    };
  }

  listTradingReport(
    skip: number,
    take: number,
    from?: string,
    to?: string,
    side?: GoldTradeSide,
    status?: GoldTradeStatus,
  ) {
    const createdAt = createdAtRange(from, to);
    const where: Prisma.GoldTradeOrderWhereInput = {
      ...(createdAt ? { createdAt } : {}),
      ...(side ? { side } : {}),
      ...(status ? { status } : {}),
    };

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

  async getFinancialSummary(from?: string, to?: string) {
    const { fromDate, toDate } = this.resolveRange(from, to);
    const dateWhere = { createdAt: { gte: fromDate, lte: toDate } };

    const [total, posted, byType, byStatus, dailySeries] = await Promise.all([
      this.prisma.walletTransaction.count({ where: dateWhere }),
      this.prisma.walletTransaction.count({
        where: { ...dateWhere, status: 'POSTED' },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['type'],
        where: dateWhere,
        _count: { id: true },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['status'],
        where: dateWhere,
        _count: { id: true },
      }),
      this.buildWalletDailySeries(fromDate, toDate),
    ]);

    return {
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      total,
      posted,
      byType: byType.map((row) => ({
        key: row.type,
        label: row.type,
        count: row._count.id,
      })),
      byStatus: byStatus.map((row) => ({
        key: row.status,
        label: row.status,
        count: row._count.id,
      })),
      dailySeries,
    };
  }

  listFinancialReport(
    skip: number,
    take: number,
    from?: string,
    to?: string,
    type?: WalletTransactionType,
  ) {
    const createdAt = createdAtRange(from, to);
    const where: Prisma.WalletTransactionWhereInput = {
      ...(createdAt ? { createdAt } : {}),
      ...(type ? { type } : {}),
    };

    return Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);
  }

  private async buildOrderDailySeries(from: Date, to: Date) {
    return this.buildDailySeries(from, to, async (start, end) => {
      const [count, revenue] = await Promise.all([
        this.prisma.order.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: { in: [OrderStatus.PAID, OrderStatus.CONFIRMED] },
          },
        }),
        this.prisma.order.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
            status: { in: [OrderStatus.PAID, OrderStatus.CONFIRMED] },
          },
          _sum: { totalToman: true },
        }),
      ]);
      return {
        value: count,
        secondaryValue: tomanBigIntToNumber(revenue._sum.totalToman ?? 0n),
      };
    });
  }

  private async buildUserDailySeries(from: Date, to: Date) {
    return this.buildDailySeries(from, to, async (start, end) => {
      const count = await this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      });
      return { value: count };
    });
  }

  private async buildTradeDailySeries(from: Date, to: Date) {
    return this.buildDailySeries(from, to, async (start, end) => {
      const count = await this.prisma.goldTradeOrder.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: GoldTradeStatus.FILLED,
        },
      });
      return { value: count };
    });
  }

  private async buildWalletDailySeries(from: Date, to: Date) {
    return this.buildDailySeries(from, to, async (start, end) => {
      const count = await this.prisma.walletTransaction.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'POSTED',
        },
      });
      return { value: count };
    });
  }

  private async buildDailySeries(
    from: Date,
    to: Date,
    fn: (start: Date, end: Date) => Promise<{ value: number; secondaryValue?: number }>,
  ) {
    const series: Array<{ label: string; value: number; secondaryValue?: number }> = [];
    const end = new Date(to);
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= end && series.length < DAILY_SERIES_DAYS) {
      const dayStart = new Date(cursor);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);
      const point = await fn(dayStart, dayEnd);
      series.push({
        label: dayStart.toISOString().slice(0, 10),
        ...point,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return series.slice(-DAILY_SERIES_DAYS);
  }
}
