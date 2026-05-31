import type { GoldTickerItem, MarketPricesSnapshot } from '@sadafgold/shared';

export type MarketCacheFreshness = 'fresh' | 'stale' | 'miss';

export interface MarketCacheMeta {
  cachedAt: string;
  expiresAt: string;
  staleUntil: string;
  provider: string;
  source: 'brsapi' | 'fallback';
  version: number;
}

export interface MarketCacheEnvelope {
  payload: MarketPricesSnapshot;
  meta: MarketCacheMeta;
}

export interface CachedGoldPrices {
  gold18k: number | null;
  gold24k: number | null;
  items: GoldTickerItem[];
  cachedAt: string;
}

export interface CachedCurrencyPrices {
  usd: number | null;
  cachedAt: string;
}

export interface MarketCacheReadResult {
  envelope: MarketCacheEnvelope | null;
  freshness: MarketCacheFreshness;
  ageSeconds: number | null;
  ttlSeconds: number | null;
}

export interface MarketCacheLayerHealth {
  present: boolean;
  freshness: MarketCacheFreshness;
  ageSeconds: number | null;
  ttlSeconds: number | null;
}

export interface MarketCacheHealthReport {
  status: 'ok' | 'degraded' | 'down';
  redis: 'up' | 'down';
  gold: MarketCacheLayerHealth;
  currency: MarketCacheLayerHealth;
  snapshot: MarketCacheLayerHealth;
  lastSyncAt: string | null;
  provider: string | null;
  checkedAt: string;
}
