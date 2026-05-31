import type { ApiEnv } from '@sadafgold/shared/api-env';

export interface MarketCacheTtlConfig {
  goldTtlSeconds: number;
  currencyTtlSeconds: number;
  staleMaxSeconds: number;
  syncLockTtlSeconds: number;
}

export function resolveMarketCacheTtl(env: ApiEnv): MarketCacheTtlConfig {
  const goldTtlSeconds = env.MARKET_GOLD_CACHE_TTL_SECONDS ?? env.MARKET_CACHE_TTL_SECONDS;
  const currencyTtlSeconds =
    env.MARKET_CURRENCY_CACHE_TTL_SECONDS ?? env.MARKET_CACHE_TTL_SECONDS;

  return {
    goldTtlSeconds,
    currencyTtlSeconds,
    staleMaxSeconds: env.MARKET_CACHE_STALE_SECONDS,
    syncLockTtlSeconds: env.MARKET_SYNC_LOCK_TTL_SECONDS,
  };
}

export function buildCacheMeta(options: {
  provider: string;
  source: 'brsapi' | 'fallback';
  goldTtlSeconds: number;
  staleMaxSeconds: number;
  version?: number;
}): { cachedAt: string; expiresAt: string; staleUntil: string; provider: string; source: 'brsapi' | 'fallback'; version: number } {
  const cachedAt = new Date();
  const expiresAt = new Date(cachedAt.getTime() + options.goldTtlSeconds * 1000);
  const staleUntil = new Date(cachedAt.getTime() + options.staleMaxSeconds * 1000);

  return {
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    staleUntil: staleUntil.toISOString(),
    provider: options.provider,
    source: options.source,
    version: options.version ?? 1,
  };
}

export function resolveCacheFreshness(
  meta: { expiresAt: string; staleUntil: string },
  now = Date.now(),
): 'fresh' | 'stale' | 'miss' {
  const expiresAtMs = Date.parse(meta.expiresAt);
  const staleUntilMs = Date.parse(meta.staleUntil);

  if (Number.isNaN(expiresAtMs) || Number.isNaN(staleUntilMs)) {
    return 'miss';
  }

  if (now < expiresAtMs) {
    return 'fresh';
  }

  if (now < staleUntilMs) {
    return 'stale';
  }

  return 'miss';
}

export function cacheAgeSeconds(cachedAt: string, now = Date.now()): number {
  const cachedAtMs = Date.parse(cachedAt);
  if (Number.isNaN(cachedAtMs)) {
    return 0;
  }

  return Math.max(0, Math.floor((now - cachedAtMs) / 1000));
}
