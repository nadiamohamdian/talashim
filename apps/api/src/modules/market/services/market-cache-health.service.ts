import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service';
import {
  cacheAgeSeconds,
  resolveCacheFreshness,
} from '../config/market-cache.config';
import { MARKET_REDIS_KEYS } from '../constants/redis-keys';
import type {
  MarketCacheHealthReport,
  MarketCacheLayerHealth,
} from '../interfaces/market-cache.types';
import { MarketCacheService } from './market-cache.service';

@Injectable()
export class MarketCacheHealthService {
  private readonly logger = new Logger(MarketCacheHealthService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly marketCache: MarketCacheService,
  ) {}

  async getHealth(): Promise<MarketCacheHealthReport> {
    const checkedAt = new Date().toISOString();

    let redisUp = false;
    try {
      redisUp = (await this.redis.ping()) === 'PONG';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Market cache health — Redis ping failed: ${message}`);
    }

    if (!redisUp) {
      return {
        status: 'down',
        redis: 'down',
        gold: this.emptyLayer('miss'),
        currency: this.emptyLayer('miss'),
        snapshot: this.emptyLayer('miss'),
        lastSyncAt: null,
        provider: null,
        checkedAt,
      };
    }

    const [gold, currency, meta, snapshotTtl, goldTtl, currencyTtl] = await Promise.all([
      this.marketCache.getGoldLayer(),
      this.marketCache.getCurrencyLayer(),
      this.marketCache.getMeta(),
      this.redis.ttl(MARKET_REDIS_KEYS.snapshot),
      this.redis.ttl(MARKET_REDIS_KEYS.gold),
      this.redis.ttl(MARKET_REDIS_KEYS.currency),
    ]);

    const snapshotFreshness = meta ? resolveCacheFreshness(meta) : 'miss';
    const lastSyncAt = meta?.cachedAt ?? null;
    const provider = meta?.provider ?? null;

    const goldLayer = this.buildLayerHealth(gold != null, gold?.cachedAt ?? lastSyncAt, goldTtl);
    const currencyLayer = this.buildLayerHealth(
      currency != null,
      currency?.cachedAt ?? lastSyncAt,
      currencyTtl,
    );
    const snapshotLayer = this.buildLayerHealth(
      meta != null,
      lastSyncAt,
      snapshotTtl,
      snapshotFreshness,
    );

    const status = this.resolveOverallStatus(snapshotFreshness, gold != null, currency != null);

    if (status === 'degraded') {
      this.logger.warn(
        `Market cache health degraded (snapshotFreshness=${snapshotFreshness}, provider=${provider})`,
      );
    }

    return {
      status,
      redis: 'up',
      gold: goldLayer,
      currency: currencyLayer,
      snapshot: snapshotLayer,
      lastSyncAt,
      provider,
      checkedAt,
    };
  }

  private resolveOverallStatus(
    snapshotFreshness: 'fresh' | 'stale' | 'miss',
    hasGold: boolean,
    hasCurrency: boolean,
  ): 'ok' | 'degraded' | 'down' {
    if (snapshotFreshness === 'fresh' && hasGold && hasCurrency) {
      return 'ok';
    }

    if (snapshotFreshness === 'stale' || (hasGold && hasCurrency)) {
      return 'degraded';
    }

    return 'down';
  }

  private buildLayerHealth(
    present: boolean,
    cachedAt: string | null,
    ttlSeconds: number,
    freshnessOverride?: 'fresh' | 'stale' | 'miss',
  ): MarketCacheLayerHealth {
    if (!present || !cachedAt) {
      return this.emptyLayer('miss');
    }

    const ageSeconds = cacheAgeSeconds(cachedAt);
    const freshness =
      freshnessOverride ??
      (ttlSeconds > 0 ? 'fresh' : ageSeconds > 0 ? 'stale' : 'miss');

    return {
      present: true,
      freshness,
      ageSeconds,
      ttlSeconds: ttlSeconds > 0 ? ttlSeconds : null,
    };
  }

  private emptyLayer(freshness: 'fresh' | 'stale' | 'miss'): MarketCacheLayerHealth {
    return {
      present: false,
      freshness,
      ageSeconds: null,
      ttlSeconds: null,
    };
  }
}
