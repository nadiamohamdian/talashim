'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TradeSide } from '@sadafgold/types';
import { marketApi, type MarketTradePayload } from '@/lib/api/market.api';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';

function buildIdempotencyKey(side: TradeSide): string {
  return `web-${side.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useWalletBalances() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.wallet.balances(user?.id ?? ''),
    queryFn: ({ signal }) => marketApi.getWalletBalances(user!.id, signal),
    enabled: Boolean(user?.id),
    refetchInterval: 15_000,
  });
}

export function useWalletTransactions(page = 1, limit = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.wallet.transactions(user?.id ?? '', page),
    queryFn: ({ signal }) => marketApi.getWalletTransactions(user!.id, page, limit, signal),
    enabled: Boolean(user?.id),
  });
}

export function useTradeOrders(params?: { page?: number; limit?: number; side?: TradeSide }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.trading.orders(user?.id ?? '', params),
    queryFn: ({ signal }) => marketApi.getTradeHistory(user!.id, params, signal),
    enabled: Boolean(user?.id),
  });
}

export function useExecuteTrade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      side: TradeSide;
      quantityGram: string;
      karat: number;
      symbol: string;
    }) => {
      if (!user) throw new Error('وارد حساب کاربری شوید');

      const payload: MarketTradePayload = {
        userId: user.id,
        quantityGram: input.quantityGram,
        karat: input.karat,
        symbol: input.symbol,
        idempotencyKey: buildIdempotencyKey(input.side),
      };

      return input.side === 'BUY'
        ? marketApi.executeMarketBuy(payload)
        : marketApi.executeMarketSell(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trading.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() }),
      ]);
    },
  });
}

/** @deprecated Use useExecuteTrade */
export const useExecuteTradeMutation = useExecuteTrade;
