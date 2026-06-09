import { apiPost } from '@/lib/api/client';

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

export function submitProductReview(slug: string, payload: SubmitProductReviewPayload) {
  return apiPost<SubmitProductReviewResponse>(`/catalog/reviews/${slug}`, payload);
}
