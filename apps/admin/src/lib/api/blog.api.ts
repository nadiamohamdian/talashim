import { axiosClient } from '@/shared/api/axios-client';
import type { BlogPostSummary, PaginatedResponse } from '@sadafgold/types';

export function fetchBlogPosts(params?: { page?: number; limit?: number }) {
  return axiosClient
    .get<PaginatedResponse<BlogPostSummary>>('/blog', { params })
    .then((r) => r.data);
}
