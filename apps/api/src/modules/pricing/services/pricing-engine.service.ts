import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoldPriceSource } from '@/generated/prisma';
import { getApiEnv } from '@/config/env';
import {
  GOLD_PRICE_FALLBACK_PROVIDER,
  GOLD_PRICE_PRIMARY_PROVIDER,
  type GoldPriceProvider,
  type GoldSpotQuote,
} from '../interfaces/price-provider.interface';
import type { LiveGoldPriceDto } from '../dto/gold-price.dto';
import { PricingCacheService } from './pricing-cache.service';
import { PricingConfigRepository } from '../repositories/pricing-config.repository';
import { PricingRepository } from '../repositories/pricing.repository';

@Injectable()
export class PricingEngineService {
  private readonly logger = new Logger(PricingEngineService.name);

  constructor(
    @Inject(GOLD_PRICE_PRIMARY_PROVIDER)
    private readonly primaryProvider: GoldPriceProvider,
    @Inject(GOLD_PRICE_FALLBACK_PROVIDER)
    private readonly fallbackProvider: GoldPriceProvider,
    private readonly pricingCache: PricingCacheService,
    private readonly pricingRepository: PricingRepository,
    private readonly pricingConfigRepository: PricingConfigRepository,
  ) {}

  async refreshLivePrice(symbol = 'XAU-IRR', karat = 18): Promise<LiveGoldPriceDto> {
    const quote = await this.resolveQuote(symbol, karat);
    const livePrice = await this.toLivePrice(quote);

    await this.pricingCache.setLatest(livePrice);
    await this.pricingRepository.saveTick({
      symbol: livePrice.symbol,
      karat: livePrice.karat,
      pricePerGram: Number(livePrice.pricePerGram),
      buyPrice: Number(livePrice.buyPrice),
      sellPrice: Number(livePrice.sellPrice),
      spreadPercent: Number(livePrice.spreadPercent),
      source: livePrice.source,
      providerName: livePrice.providerName,
      recordedAt: new Date(livePrice.recordedAt),
    });

    return livePrice;
  }

  async getLivePrice(symbol = 'XAU-IRR', karat = 18): Promise<LiveGoldPriceDto> {
    const override = await this.pricingConfigRepository.findActiveOverride(symbol, karat);
    if (override) {
      return this.overrideToLivePrice(override, symbol, karat);
    }

    const cached = await this.pricingCache.getLatest(symbol, karat);
    if (cached) return cached;

    const latest = await this.pricingRepository.findLatest(symbol, karat);
    if (latest) {
      return {
        symbol: latest.symbol,
        karat: latest.karat,
        pricePerGram: latest.pricePerGram.toString(),
        buyPrice: latest.buyPrice.toString(),
        sellPrice: latest.sellPrice.toString(),
        spreadPercent: latest.spreadPercent.toString(),
        source: latest.source,
        providerName: latest.providerName,
        recordedAt: latest.recordedAt.toISOString(),
      };
    }

    return this.refreshLivePrice(symbol, karat);
  }

  private async resolveQuote(symbol: string, karat: number): Promise<GoldSpotQuote & { source: GoldPriceSource }> {
    try {
      const quote = await this.primaryProvider.fetchSpotQuote(symbol, karat);
      return { ...quote, source: GoldPriceSource.PRIMARY };
    } catch (error) {
      this.logger.warn(
        `Primary provider failed, using fallback: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      const quote = await this.fallbackProvider.fetchSpotQuote(symbol, karat);
      return { ...quote, source: GoldPriceSource.FALLBACK };
    }
  }

  private async getSpreadPercent(): Promise<number> {
    const config = await this.pricingConfigRepository.getOrCreateConfig();
    return Number(config.spreadPercent);
  }

  private async toLivePrice(
    quote: GoldSpotQuote & { source: GoldPriceSource },
  ): Promise<LiveGoldPriceDto> {
    const spreadPercent = await this.getSpreadPercent();
    const spread = spreadPercent / 100;
    const halfSpread = (quote.pricePerGramToman * spread) / 2;

    return {
      symbol: quote.symbol,
      karat: quote.karat,
      pricePerGram: quote.pricePerGramToman.toFixed(0),
      buyPrice: Math.round(quote.pricePerGramToman - halfSpread).toFixed(0),
      sellPrice: Math.round(quote.pricePerGramToman + halfSpread).toFixed(0),
      spreadPercent: spreadPercent.toFixed(4),
      source: quote.source,
      providerName: quote.providerName,
      recordedAt: quote.capturedAt.toISOString(),
    };
  }

  private async overrideToLivePrice(
    override: {
      pricePerGram: { toString(): string };
      buyPrice: { toString(): string } | null;
      sellPrice: { toString(): string } | null;
      updatedAt: Date;
    },
    symbol: string,
    karat: number,
  ): Promise<LiveGoldPriceDto> {
    const spreadPercent = await this.getSpreadPercent();
    const mid = Number(override.pricePerGram);
    const halfSpread = (mid * (spreadPercent / 100)) / 2;

    return {
      symbol,
      karat,
      pricePerGram: mid.toFixed(0),
      buyPrice: override.buyPrice
        ? Number(override.buyPrice).toFixed(0)
        : Math.round(mid - halfSpread).toFixed(0),
      sellPrice: override.sellPrice
        ? Number(override.sellPrice).toFixed(0)
        : Math.round(mid + halfSpread).toFixed(0),
      spreadPercent: spreadPercent.toFixed(4),
      source: GoldPriceSource.MANUAL,
      providerName: 'manual-override',
      recordedAt: override.updatedAt.toISOString(),
    };
  }
}
