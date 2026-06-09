import type { PaginatedResponse, ProductSummary } from '@sadafgold/types';

export function normalizeCatalogListResponse(data: unknown): ProductSummary[] {
  if (Array.isArray(data)) {
    return data as ProductSummary[];
  }

  if (data && typeof data === 'object' && 'items' in data) {
    const items = (data as PaginatedResponse<ProductSummary>).items;
    return Array.isArray(items) ? items : [];
  }

  return [];
}
