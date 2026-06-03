'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi, type CheckoutPayload } from '@/lib/api/order.api';
import { queryKeys, type OrdersListParams } from '@/lib/api/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function useOrders(params: OrdersListParams = {}) {
  const page = params.page ?? 1;
  return useQuery({
    queryKey: queryKeys.orders.list({ ...params, page }),
    queryFn: ({ signal }) => orderApi.list({ ...params, page }, signal),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: ({ signal }) => orderApi.getById(orderId, signal),
    enabled: Boolean(orderId),
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => orderApi.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useCart(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.cart.me(),
    queryFn: ({ signal }) => orderApi.getCart(signal),
    staleTime: 10_000,
    refetchInterval: 60_000,
    enabled: (options?.enabled ?? true) && isAuthenticated,
  });
}

export function useUpsertCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.upsertCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
