import type {
  GoldPriceHistoryPoint,
  GoldTradeOrder,
  LiveGoldPrice,
  TradeHistoryResponse,
  TradeSide,
  WalletBalances,
  WalletHistoryResponse,
} from '@sadafgold/types';
import type { GoldTickerPayload } from '@sadafgold/shared';
import { apiGet, apiPost } from '@/lib/api/client';

export interface MarketTradePayload {
  userId: string;
  quantityGram: string;
  idempotencyKey: string;
  symbol?: string;
  karat?: number;
  description?: string;
}

export interface MarketPricesResponse {
  items: Array<{
    symbol: string;
    name: string;
    price: number;
    unit: string;
  }>;
  updatedAt: string;
}

export const marketApi = {
  getLivePrice(karat = 18, symbol = 'XAU-IRR', signal?: AbortSignal): Promise<LiveGoldPrice> {
    return apiGet<LiveGoldPrice>('/pricing/live', {
      params: { karat, symbol },
      signal,
      abortKey: `market:live:${symbol}:${karat}`,
    });
  },

  getPriceHistory(
    karat = 18,
    symbol = 'XAU-IRR',
    limit = 48,
    signal?: AbortSignal,
  ): Promise<GoldPriceHistoryPoint[]> {
    return apiGet<GoldPriceHistoryPoint[]>('/pricing/history', {
      params: { karat, symbol, limit },
      signal,
      abortKey: `market:history:${symbol}:${karat}:${limit}`,
    });
  },

  getMarketPrices(signal?: AbortSignal): Promise<MarketPricesResponse> {
    return apiGet<MarketPricesResponse>('/market/prices', {
      signal,
      abortKey: 'market:snapshot',
    });
  },

  async getGoldTicker(signal?: AbortSignal): Promise<GoldTickerPayload> {
    const response = await fetch('/api/market/gold-ticker', {
      cache: 'no-store',
      signal,
    });
    if (!response.ok) {
      throw new Error('دریافت قیمت طلا ناموفق بود');
    }
    return response.json() as Promise<GoldTickerPayload>;
  },

  getWalletBalances(userId: string, signal?: AbortSignal): Promise<WalletBalances> {
    return apiGet<WalletBalances>(`/wallet/${userId}/balances`, {
      signal,
      abortKey: `wallet:balances:${userId}`,
    });
  },

  getWalletTransactions(
    userId: string,
    page = 1,
    limit = 20,
    signal?: AbortSignal,
  ): Promise<WalletHistoryResponse> {
    return apiGet<WalletHistoryResponse>(`/wallet/${userId}/transactions`, {
      params: { page, limit },
      signal,
      abortKey: `wallet:tx:${userId}:${page}`,
    });
  },

  executeMarketBuy(payload: MarketTradePayload): Promise<GoldTradeOrder> {
    return apiPost<GoldTradeOrder>('/trading/market/buy', payload);
  },

  executeMarketSell(payload: MarketTradePayload): Promise<GoldTradeOrder> {
    return apiPost<GoldTradeOrder>('/trading/market/sell', payload);
  },

  getTradeHistory(
    userId: string,
    params?: { page?: number; limit?: number; side?: TradeSide },
    signal?: AbortSignal,
  ): Promise<TradeHistoryResponse> {
    return apiGet<TradeHistoryResponse>(`/trading/${userId}/orders`, {
      params,
      signal,
      abortKey: `trading:orders:${userId}:${JSON.stringify(params ?? {})}`,
    });
  },
};

export const {
  getLivePrice,
  getPriceHistory,
  getMarketPrices,
  getGoldTicker,
  getWalletBalances,
  getWalletTransactions,
  executeMarketBuy,
  executeMarketSell,
  getTradeHistory,
} = marketApi;
