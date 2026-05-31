'use client';

export { useLiveMarketPrices as useLiveGoldPrice } from '@/lib/api/hooks/use-market-prices';

/** @deprecated Import `queryKeys.market.live` from `@/lib/api` */
export const LIVE_GOLD_PRICE_KEY = ['pricing', 'live'] as const;
