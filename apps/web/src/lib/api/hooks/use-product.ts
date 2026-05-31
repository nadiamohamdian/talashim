'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api/product.api';
import { queryKeys } from '@/lib/api/query-keys';

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: ({ signal }) => productApi.getBySlug(slug, signal),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
