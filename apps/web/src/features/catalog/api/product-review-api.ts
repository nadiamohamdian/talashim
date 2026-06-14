import { apiGet, apiPost } from '@/lib/api/client';

export interface SubmitProductReviewPayload {
  body: string;
  rating: number;
  phone: string;
}

export interface SubmitProductReviewResponse {
  success: boolean;
  reviewId: string;
  message: string;
}

export interface ProductReviewItem {
  id: string;
  author: string;
  body: string;
  rating: number;
  date: string;
}

export function fetchProductReviews(slug: string, signal?: AbortSignal) {
  return apiGet<ProductReviewItem[]>(`/catalog/reviews/${slug}`, { signal });
}

export function submitProductReview(slug: string, payload: SubmitProductReviewPayload) {
  return apiPost<SubmitProductReviewResponse>(`/catalog/reviews/${slug}`, payload);
}
