import { GoldPriceSource, Prisma } from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  saveTick(payload: {
    symbol: string;
    karat: number;
    pricePerGram: number;
    buyPrice: number;
    sellPrice: number;
    spreadPercent: number;
    source: GoldPriceSource;
    providerName: string;
    recordedAt: Date;
  }) {
    return this.prisma.goldPriceTick.create({
      data: {
        symbol: payload.symbol,
        karat: payload.karat,
        pricePerGram: new Prisma.Decimal(payload.pricePerGram),
        buyPrice: new Prisma.Decimal(payload.buyPrice),
        sellPrice: new Prisma.Decimal(payload.sellPrice),
        spreadPercent: new Prisma.Decimal(payload.spreadPercent),
        source: payload.source,
        providerName: payload.providerName,
        recordedAt: payload.recordedAt,
      },
    });
  }

  findLatest(symbol: string, karat: number) {
    return this.prisma.goldPriceTick.findFirst({
      where: { symbol, karat },
      orderBy: { recordedAt: 'desc' },
    });
  }

  findHistory(symbol: string, karat: number, from: Date, to: Date, take: number) {
    return this.prisma.goldPriceTick.findMany({
      where: {
        symbol,
        karat,
        recordedAt: { gte: from, lte: to },
      },
      orderBy: { recordedAt: 'desc' },
      take,
    });
  }
}
