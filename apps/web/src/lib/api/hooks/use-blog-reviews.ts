'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBlogPostReviews } from '@/features/blog/api/blog-review-api';
import { queryKeys } from '@/lib/api/query-keys';

export function useBlogPostReviews(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.reviews(slug),
    queryFn: ({ signal }) => fetchBlogPostReviews(slug, signal),
    staleTime: 30_000,
  });
}
