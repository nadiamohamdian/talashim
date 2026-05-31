import { Injectable } from '@nestjs/common';
import { getApiEnv } from '@/config/env';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { PRICING_REDIS_KEYS } from '../constants/redis-keys';
import type { LiveGoldPriceDto } from '../dto/gold-price.dto';

@Injectable()
export class PricingCacheService {
  constructor(private readonly redis: RedisService) {}

  async getLatest(symbol: string, karat: number): Promise<LiveGoldPriceDto | null> {
    const raw = await this.redis.get(PRICING_REDIS_KEYS.latest(symbol, karat));
    if (!raw) return null;
    return JSON.parse(raw) as LiveGoldPriceDto;
  }

  async setLatest(price: LiveGoldPriceDto) {
    const env = getApiEnv();
    await this.redis.set(
      PRICING_REDIS_KEYS.latest(price.symbol, price.karat),
      JSON.stringify(price),
      env.GOLD_PRICE_CACHE_TTL_SECONDS,
    );
  }
}
