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

export function normalizeCatalogPaginatedResponse(
  data: unknown,
  fallbackPage = 1,
  fallbackLimit = 12,
): PaginatedResponse<ProductSummary> {
  if (data && typeof data === 'object' && 'items' in data) {
    const payload = data as PaginatedResponse<ProductSummary>;
    return {
      page: payload.page ?? fallbackPage,
      limit: payload.limit ?? fallbackLimit,
      total: payload.total ?? payload.items.length,
      items: Array.isArray(payload.items) ? payload.items : [],
    };
  }

  const items = normalizeCatalogListResponse(data);
  return {
    page: fallbackPage,
    limit: fallbackLimit,
    total: items.length,
    items,
  };
}
