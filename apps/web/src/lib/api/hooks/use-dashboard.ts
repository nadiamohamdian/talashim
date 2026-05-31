'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api/order.api';
import { queryKeys } from '@/lib/api/query-keys';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.user.dashboard(),
    queryFn: ({ signal }) => orderApi.getAccountSummary(signal),
    staleTime: 30_000,
  });
}

/** @deprecated Use useDashboard */
export const useAccountSummary = useDashboard;
