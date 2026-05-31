import { axiosClient } from '@/shared/api/axios-client';
import type { PaginatedResponse, ProductDetails, ProductSummary } from '@sadafgold/types';

export function fetchCatalog(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<ProductSummary>>('/catalog', { params })
    .then((r) => r.data);
}

export function fetchCatalogBySlug(slug: string) {
  return axiosClient.get<ProductDetails>(`/catalog/${slug}`).then((r) => r.data);
}

export function fetchCatalogCategories() {
  return axiosClient
    .get<Array<{ slug: string; label: string; count?: number }>>('/catalog/categories')
    .then((r) => r.data);
}
