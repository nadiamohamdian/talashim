import type {
  GoldPriceHistoryPoint,
  GoldTradeOrder,
  LiveGoldPrice,
  TradeHistoryResponse,
  TradeSide,
  WalletBalances,
  WalletHistoryResponse,
} from '@sadafgold/types';
import { buildFallbackGoldTicker, type GoldTickerPayload } from '@sadafgold/shared';
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
    try {
      const response = await fetch('/api/market/gold-ticker', {
        cache: 'no-store',
        signal,
      });
      if (!response.ok) {
        return buildFallbackGoldTicker();
      }
      const payload = (await response.json()) as GoldTickerPayload;
      if (!payload.items?.length) {
        return buildFallbackGoldTicker();
      }
      return payload;
    } catch {
      return buildFallbackGoldTicker();
    }
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

export const getLivePrice = marketApi.getLivePrice.bind(marketApi);
export const getPriceHistory = marketApi.getPriceHistory.bind(marketApi);
export const getMarketPrices = marketApi.getMarketPrices.bind(marketApi);
export const getGoldTicker = marketApi.getGoldTicker.bind(marketApi);
export const getWalletBalances = marketApi.getWalletBalances.bind(marketApi);
export const getWalletTransactions = marketApi.getWalletTransactions.bind(marketApi);
export const executeMarketBuy = marketApi.executeMarketBuy.bind(marketApi);
export const executeMarketSell = marketApi.executeMarketSell.bind(marketApi);
export const getTradeHistory = marketApi.getTradeHistory.bind(marketApi);
