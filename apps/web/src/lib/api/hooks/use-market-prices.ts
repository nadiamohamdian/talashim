'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buildFallbackGoldTicker } from '@sadafgold/shared';
import { marketApi } from '@/lib/api/market.api';
import { queryKeys, type MarketHistoryParams, type MarketPriceParams } from '@/lib/api/query-keys';
import { subscribeLivePrice } from '@/features/trading/lib/pricing-socket';
import { useTradingStore } from '@/features/trading/model/trading-store';

export function useMarketPrices(params: MarketPriceParams = {}) {
  const storeKarat = useTradingStore((s) => s.karat);
  const storeSymbol = useTradingStore((s) => s.symbol);
  const karat = params.karat ?? storeKarat;
  const symbol = params.symbol ?? storeSymbol;

  return useQuery({
    queryKey: queryKeys.market.live({ symbol, karat }),
    queryFn: ({ signal }) => marketApi.getLivePrice(karat, symbol, signal),
    refetchInterval: 60_000,
    staleTime: 5_000,
  });
}

/** Live price with WebSocket cache updates (trading dashboard). */
export function useLiveMarketPrices(params: MarketPriceParams = {}) {
  const storeKarat = useTradingStore((s) => s.karat);
  const storeSymbol = useTradingStore((s) => s.symbol);
  const karat = params.karat ?? storeKarat;
  const symbol = params.symbol ?? storeSymbol;
  const queryClient = useQueryClient();

  const query = useMarketPrices({ symbol, karat });

  useEffect(() => {
    return subscribeLivePrice((price) => {
      queryClient.setQueryData(queryKeys.market.live({ symbol, karat }), price);
    });
  }, [queryClient, symbol, karat]);

  return query;
}

export function useMarketPriceHistory(params: MarketHistoryParams = {}) {
  const storeKarat = useTradingStore((s) => s.karat);
  const storeSymbol = useTradingStore((s) => s.symbol);
  const karat = params.karat ?? storeKarat;
  const symbol = params.symbol ?? storeSymbol;
  const limit = params.limit ?? 48;

  return useQuery({
    queryKey: queryKeys.market.history({ symbol, karat, limit }),
    queryFn: ({ signal }) => marketApi.getPriceHistory(karat, symbol, limit, signal),
    staleTime: 60_000,
  });
}

export function useGoldTicker() {
  return useQuery({
    queryKey: queryKeys.market.ticker(),
    queryFn: ({ signal }) => marketApi.getGoldTicker(signal),
    placeholderData: buildFallbackGoldTicker(),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMarketSnapshot() {
  return useQuery({
    queryKey: queryKeys.market.snapshot(),
    queryFn: ({ signal }) => marketApi.getMarketPrices(signal),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
