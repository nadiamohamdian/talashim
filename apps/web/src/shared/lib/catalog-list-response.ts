import type { PaginatedResponse, ProductSummary } from '@sadafgold/types';
import { resolveStorefrontProductImageUrl } from '@sadafgold/shared';

export function normalizeProductSummary(product: ProductSummary): ProductSummary {
  return {
    ...product,
    imageUrl: resolveStorefrontProductImageUrl(product.imageUrl, product.category),
    hoverImageUrl: product.hoverImageUrl
      ? resolveStorefrontProductImageUrl(product.hoverImageUrl, product.category)
      : product.hoverImageUrl,
  };
}

export function normalizeCatalogListResponse(data: unknown): ProductSummary[] {
  const items = (() => {
    if (Array.isArray(data)) {
      return data as ProductSummary[];
    }

    if (data && typeof data === 'object' && 'items' in data) {
      const list = (data as PaginatedResponse<ProductSummary>).items;
      return Array.isArray(list) ? list : [];
    }

    return [];
  })();

  return items.map(normalizeProductSummary);
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
      items: Array.isArray(payload.items)
        ? payload.items.map(normalizeProductSummary)
        : [],
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
