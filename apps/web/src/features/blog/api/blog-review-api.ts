import { apiGet, apiPost } from '@/lib/api/client';

export interface SubmitBlogPostReviewPayload {
  body: string;
  rating: number;
  phone: string;
}

export interface SubmitBlogPostReviewResponse {
  success: boolean;
  reviewId: string;
  message: string;
}

export interface BlogPostReviewItem {
  id: string;
  author: string;
  body: string;
  rating: number;
  date: string;
}

export function fetchBlogPostReviews(slug: string, signal?: AbortSignal) {
  return apiGet<BlogPostReviewItem[]>(`/blog/reviews/${slug}`, { signal });
}

export function submitBlogPostReview(slug: string, payload: SubmitBlogPostReviewPayload) {
  return apiPost<SubmitBlogPostReviewResponse>(`/blog/reviews/${slug}`, payload);
}
