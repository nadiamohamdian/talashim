import { Inject, Injectable, Logger } from '@nestjs/common';
import type { MarketPricesSnapshot } from '@sadafgold/shared';
import {
  MARKET_DATA_FALLBACK_PROVIDER,
  MARKET_DATA_PRIMARY_PROVIDER,
  type MarketDataProvider,
} from '../interfaces/market-data-provider.interface';
import type { MarketCacheFreshness } from '../interfaces/market-cache.types';
import type { MarketPricesResponseDto } from '../dto/market-prices-response.dto';
import { MarketCacheHealthService } from './market-cache-health.service';
import { MarketCacheService } from './market-cache.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private syncInFlight: Promise<MarketPricesSnapshot> | null = null;

  constructor(
    @Inject(MARKET_DATA_PRIMARY_PROVIDER)
    private readonly primaryProvider: MarketDataProvider,
    @Inject(MARKET_DATA_FALLBACK_PROVIDER)
    private readonly fallbackProvider: MarketDataProvider,
    private readonly marketCache: MarketCacheService,
    private readonly marketCacheHealth: MarketCacheHealthService,
  ) {}

  /** Read path — never hits BRS directly. */
  async getPrices(): Promise<MarketPricesResponseDto> {
    const cached = await this.marketCache.readSnapshot();

    if (cached.envelope && cached.freshness === 'fresh') {
      return this.toResponse(cached.envelope.payload, {
        fromCache: true,
        isStale: false,
        cacheAgeSeconds: cached.ageSeconds,
        cacheFreshness: cached.freshness,
      });
    }

    if (cached.envelope && cached.freshness === 'stale') {
      void this.syncFromProvider().catch((error) => {
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`Background revalidation failed: ${message}`);
      });

      return this.toResponse(cached.envelope.payload, {
        fromCache: true,
        isStale: true,
        cacheAgeSeconds: cached.ageSeconds,
        cacheFreshness: cached.freshness,
      });
    }

    const synced = await this.syncFromProvider();
    return this.toResponse(synced, {
      fromCache: false,
      isStale: false,
      cacheAgeSeconds: 0,
      cacheFreshness: 'fresh',
    });
  }

  async syncFromProvider(): Promise<MarketPricesSnapshot> {
    if (this.syncInFlight) {
      return this.syncInFlight;
    }

    this.syncInFlight = this.runSync();

    try {
      return await this.syncInFlight;
    } finally {
      this.syncInFlight = null;
    }
  }

  async forceRefresh(): Promise<MarketPricesResponseDto> {
    await this.marketCache.invalidate('force-refresh');
    const snapshot = await this.runSync({ skipLock: true });
    return this.toResponse(snapshot, {
      fromCache: false,
      isStale: false,
      cacheAgeSeconds: 0,
      cacheFreshness: 'fresh',
    });
  }

  async invalidateCache(reason = 'api-request') {
    const removed = await this.marketCache.invalidate(reason);
    return { invalidated: true, keysRemoved: removed };
  }

  getCacheHealth() {
    return this.marketCacheHealth.getHealth();
  }

  private async runSync(options?: { skipLock?: boolean }): Promise<MarketPricesSnapshot> {
    const lockAcquired = options?.skipLock ? true : await this.marketCache.acquireSyncLock();

    if (!lockAcquired) {
      const cached = await this.marketCache.readSnapshot();
      if (cached.envelope) {
        return cached.envelope.payload;
      }
    }

    try {
      const snapshot = await this.primaryProvider.fetchSnapshot();
      await this.marketCache.writeSnapshot(snapshot);
      this.logger.log(
        `Market sync succeeded (provider=${snapshot.provider}, gold18k=${snapshot.gold18k}, usd=${snapshot.usd})`,
      );
      return snapshot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Market sync failed: ${message}`);

      const stale = await this.marketCache.readSnapshot();
      if (stale.envelope && stale.freshness !== 'miss') {
        this.logger.warn('Serving stale cache after provider failure');
        return stale.envelope.payload;
      }

      const fallback = await this.fallbackProvider.fetchSnapshot();
      await this.marketCache.writeSnapshot(fallback);
      this.logger.warn(`Static fallback snapshot cached (provider=${fallback.provider})`);
      return fallback;
    } finally {
      if (lockAcquired && !options?.skipLock) {
        await this.marketCache.releaseSyncLock();
      }
    }
  }

  private toResponse(
    snapshot: MarketPricesSnapshot,
    cache: {
      fromCache: boolean;
      isStale: boolean;
      cacheAgeSeconds: number | null;
      cacheFreshness: MarketCacheFreshness;
    },
  ): MarketPricesResponseDto {
    let source: MarketPricesResponseDto['source'] = snapshot.source;

    if (cache.fromCache) {
      source = cache.isStale ? 'stale' : 'cache';
    }

    return {
      gold_18k: snapshot.gold18k,
      gold_24k: snapshot.gold24k,
      usd: snapshot.usd,
      source,
      provider: snapshot.provider,
      updatedAt: snapshot.updatedAt,
      items: snapshot.items,
      isStale: cache.isStale,
      cacheAgeSeconds: cache.cacheAgeSeconds,
      cacheFreshness: cache.cacheFreshness,
    };
  }
}
