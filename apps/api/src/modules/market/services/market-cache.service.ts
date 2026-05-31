import { Injectable, Logger } from '@nestjs/common';
import type { MarketPricesSnapshot } from '@sadafgold/shared';
import { getApiEnv } from '@/config/env';
import { RedisService } from '@/infrastructure/redis/redis.service';
import {
  buildCacheMeta,
  cacheAgeSeconds,
  resolveCacheFreshness,
  resolveMarketCacheTtl,
} from '../config/market-cache.config';
import { MARKET_REDIS_KEYS } from '../constants/redis-keys';
import type {
  CachedCurrencyPrices,
  CachedGoldPrices,
  MarketCacheEnvelope,
  MarketCacheMeta,
  MarketCacheReadResult,
} from '../interfaces/market-cache.types';

@Injectable()
export class MarketCacheService {
  private readonly logger = new Logger(MarketCacheService.name);

  constructor(private readonly redis: RedisService) {}

  async readSnapshot(): Promise<MarketCacheReadResult> {
    try {
      const [snapshotRaw, metaRaw, ttlSeconds] = await Promise.all([
        this.redis.get(MARKET_REDIS_KEYS.snapshot),
        this.redis.get(MARKET_REDIS_KEYS.meta),
        this.redis.ttl(MARKET_REDIS_KEYS.snapshot),
      ]);

      if (!snapshotRaw || !metaRaw) {
        this.logger.debug('Market cache miss — snapshot or meta not found');
        return { envelope: null, freshness: 'miss', ageSeconds: null, ttlSeconds: null };
      }

      const payload = JSON.parse(snapshotRaw) as MarketPricesSnapshot;
      const meta = JSON.parse(metaRaw) as MarketCacheMeta;
      const freshness = resolveCacheFreshness(meta);

      if (freshness === 'miss') {
        this.logger.warn(
          `Market cache expired beyond stale window (cachedAt=${meta.cachedAt}, staleUntil=${meta.staleUntil})`,
        );
        return { envelope: null, freshness: 'miss', ageSeconds: null, ttlSeconds: null };
      }

      const ageSeconds = cacheAgeSeconds(meta.cachedAt);
      const envelope: MarketCacheEnvelope = { payload, meta };

      if (freshness === 'stale') {
        this.logger.warn(
          `Serving stale market cache (age=${ageSeconds}s, provider=${meta.provider})`,
        );
      } else {
        this.logger.debug(
          `Market cache hit (fresh, age=${ageSeconds}s, ttl=${ttlSeconds}s)`,
        );
      }

      return {
        envelope,
        freshness,
        ageSeconds,
        ttlSeconds: ttlSeconds > 0 ? ttlSeconds : null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Market cache read failed: ${message}`);
      return { envelope: null, freshness: 'miss', ageSeconds: null, ttlSeconds: null };
    }
  }

  async writeSnapshot(snapshot: MarketPricesSnapshot): Promise<MarketCacheEnvelope> {
    const env = getApiEnv();
    const ttl = resolveMarketCacheTtl(env);
    const source = snapshot.source === 'cache' ? 'brsapi' : snapshot.source;

    const meta = buildCacheMeta({
      provider: snapshot.provider,
      source,
      goldTtlSeconds: ttl.goldTtlSeconds,
      staleMaxSeconds: ttl.staleMaxSeconds,
    });

    const envelope: MarketCacheEnvelope = {
      payload: {
        ...snapshot,
        source,
        updatedAt: meta.cachedAt,
      },
      meta,
    };

    const goldPayload: CachedGoldPrices = {
      gold18k: snapshot.gold18k,
      gold24k: snapshot.gold24k,
      items: snapshot.items,
      cachedAt: meta.cachedAt,
    };

    const currencyPayload: CachedCurrencyPrices = {
      usd: snapshot.usd,
      cachedAt: meta.cachedAt,
    };

    try {
      await Promise.all([
        this.redis.set(
          MARKET_REDIS_KEYS.snapshot,
          JSON.stringify(envelope.payload),
          ttl.goldTtlSeconds,
        ),
        this.redis.set(
          MARKET_REDIS_KEYS.gold,
          JSON.stringify(goldPayload),
          ttl.goldTtlSeconds,
        ),
        this.redis.set(
          MARKET_REDIS_KEYS.currency,
          JSON.stringify(currencyPayload),
          ttl.currencyTtlSeconds,
        ),
        this.redis.set(
          MARKET_REDIS_KEYS.meta,
          JSON.stringify(meta),
          ttl.staleMaxSeconds,
        ),
      ]);

      this.logger.log(
        `Market cache written (provider=${meta.provider}, goldTtl=${ttl.goldTtlSeconds}s, currencyTtl=${ttl.currencyTtlSeconds}s, staleMax=${ttl.staleMaxSeconds}s)`,
      );

      return envelope;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Market cache write failed: ${message}`);
      throw error;
    }
  }

  async invalidate(reason = 'manual'): Promise<number> {
    try {
      const deleted = await this.redis.del(...MARKET_REDIS_KEYS.all);
      this.logger.warn(`Market cache invalidated (${reason}, keysRemoved=${deleted})`);
      return deleted;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Market cache invalidation failed: ${message}`);
      throw error;
    }
  }

  async invalidateGold(): Promise<number> {
    const deleted = await this.redis.del(MARKET_REDIS_KEYS.gold);
    this.logger.warn(`Gold cache layer invalidated (keysRemoved=${deleted})`);
    return deleted;
  }

  async invalidateCurrency(): Promise<number> {
    const deleted = await this.redis.del(MARKET_REDIS_KEYS.currency);
    this.logger.warn(`Currency cache layer invalidated (keysRemoved=${deleted})`);
    return deleted;
  }

  async acquireSyncLock(): Promise<boolean> {
    const env = getApiEnv();
    const ttl = resolveMarketCacheTtl(env);
    const token = `${process.pid}:${Date.now()}`;

    const acquired = await this.redis.setIfNotExists(
      MARKET_REDIS_KEYS.syncLock,
      token,
      ttl.syncLockTtlSeconds,
    );

    if (acquired) {
      this.logger.debug(`Market sync lock acquired (ttl=${ttl.syncLockTtlSeconds}s)`);
    } else {
      this.logger.debug('Market sync lock already held — skipping duplicate sync');
    }

    return acquired;
  }

  async releaseSyncLock(): Promise<void> {
    await this.redis.del(MARKET_REDIS_KEYS.syncLock);
  }

  async getGoldLayer(): Promise<CachedGoldPrices | null> {
    const raw = await this.redis.get(MARKET_REDIS_KEYS.gold);
    return raw ? (JSON.parse(raw) as CachedGoldPrices) : null;
  }

  async getCurrencyLayer(): Promise<CachedCurrencyPrices | null> {
    const raw = await this.redis.get(MARKET_REDIS_KEYS.currency);
    return raw ? (JSON.parse(raw) as CachedCurrencyPrices) : null;
  }

  async getMeta(): Promise<MarketCacheMeta | null> {
    const raw = await this.redis.get(MARKET_REDIS_KEYS.meta);
    return raw ? (JSON.parse(raw) as MarketCacheMeta) : null;
  }
}
