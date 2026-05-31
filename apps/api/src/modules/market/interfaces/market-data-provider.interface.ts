import type { MarketPricesSnapshot } from '@sadafgold/shared';

export interface MarketDataProvider {
  readonly name: string;
  fetchSnapshot(): Promise<MarketPricesSnapshot>;
}

export const MARKET_DATA_PRIMARY_PROVIDER = Symbol('MARKET_DATA_PRIMARY_PROVIDER');
export const MARKET_DATA_FALLBACK_PROVIDER = Symbol('MARKET_DATA_FALLBACK_PROVIDER');
