'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProductReviews } from '@/features/catalog/api/product-review-api';
import { queryKeys } from '@/lib/api/query-keys';

export function useProductReviews(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.reviews(slug),
    queryFn: ({ signal }) => fetchProductReviews(slug, signal),
    staleTime: 30_000,
  });
}
