'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api/product.api';
import { queryKeys, type ProductListParams, type ProductSearchParams } from '@/lib/api/query-keys';

const CATALOG_REFETCH_MS = 60_000;

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ signal }) => productApi.list(params, signal),
    staleTime: 30_000,
    refetchInterval: CATALOG_REFETCH_MS,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: ({ signal }) => productApi.getFeatured(signal),
    staleTime: 30_000,
    refetchInterval: CATALOG_REFETCH_MS,
  });
}

export function useProductSearch(params: ProductSearchParams) {
  return useQuery({
    queryKey: queryKeys.products.search(params),
    queryFn: ({ signal }) => productApi.search(params, signal),
    enabled: params.query.length >= 2,
    staleTime: 30_000,
    refetchInterval: CATALOG_REFETCH_MS,
  });
}
