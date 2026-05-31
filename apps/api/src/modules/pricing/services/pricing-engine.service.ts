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
  ) {}

  async refreshLivePrice(symbol = 'XAU-IRR', karat = 18): Promise<LiveGoldPriceDto> {
    const quote = await this.resolveQuote(symbol, karat);
    const livePrice = this.toLivePrice(quote);

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

  private toLivePrice(quote: GoldSpotQuote & { source: GoldPriceSource }): LiveGoldPriceDto {
    const env = getApiEnv();
    const spread = env.GOLD_SPREAD_PERCENT / 100;
    const halfSpread = (quote.pricePerGramToman * spread) / 2;

    return {
      symbol: quote.symbol,
      karat: quote.karat,
      pricePerGram: quote.pricePerGramToman.toFixed(0),
      buyPrice: Math.round(quote.pricePerGramToman - halfSpread).toFixed(0),
      sellPrice: Math.round(quote.pricePerGramToman + halfSpread).toFixed(0),
      spreadPercent: env.GOLD_SPREAD_PERCENT.toFixed(4),
      source: quote.source,
      providerName: quote.providerName,
      recordedAt: quote.capturedAt.toISOString(),
    };
  }
}
