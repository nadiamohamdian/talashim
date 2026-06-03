import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { getApiEnv } from '@/config/env';

@Injectable()
export class PricingConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConfig() {
    const existing = await this.prisma.pricingConfig.findUnique({
      where: { id: 'default' },
    });
    if (existing) {
      return existing;
    }

    const env = getApiEnv();
    return this.prisma.pricingConfig.create({
      data: {
        id: 'default',
        spreadPercent: env.GOLD_SPREAD_PERCENT,
        tradeCommissionPercent: env.GOLD_TRADE_COMMISSION_PERCENT,
        defaultMakingFeePercent: 10,
        refreshIntervalMs: env.GOLD_PRICE_REFRESH_MS,
        primaryProviderName: 'brsapi',
        fallbackProviderName: 'fallback-static',
        brsEnabled: Boolean(env.BRS_API_KEY),
      },
    });
  }

  updateConfig(data: Prisma.PricingConfigUpdateInput) {
    return this.prisma.pricingConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        spreadPercent: 1.5,
        tradeCommissionPercent: 0.5,
        defaultMakingFeePercent: 10,
        refreshIntervalMs: 30_000,
      },
      update: data,
    });
  }

  findActiveOverride(symbol: string, karat: number) {
    const now = new Date();
    return this.prisma.goldPriceOverride.findFirst({
      where: {
        symbol,
        karat,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  listOverrides(skip: number, take: number, activeOnly?: boolean) {
    const where: Prisma.GoldPriceOverrideWhereInput = activeOnly ? { isActive: true } : {};
    return this.prisma.$transaction([
      this.prisma.goldPriceOverride.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.goldPriceOverride.count({ where }),
    ]);
  }

  findOverrideById(id: string) {
    return this.prisma.goldPriceOverride.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  createOverride(data: Prisma.GoldPriceOverrideCreateInput) {
    return this.prisma.goldPriceOverride.create({
      data,
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  updateOverride(id: string, data: Prisma.GoldPriceOverrideUpdateInput) {
    return this.prisma.goldPriceOverride.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  deleteOverride(id: string) {
    return this.prisma.goldPriceOverride.delete({ where: { id } });
  }
}
