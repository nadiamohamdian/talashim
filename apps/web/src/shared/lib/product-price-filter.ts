import type { ProductSummary } from '@sadafgold/types';
import { HOME_BUDGET_RANGES } from '@/shared/config/storefront-ia';
import type { ProductListingPageMeta } from '@/shared/config/product-listing-meta';
import { formatPrice } from '@/shared/lib/format-price';

export interface ProductPriceFilter {
  minPrice?: number;
  maxPrice?: number;
}

export function parsePriceQueryParam(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function parseProductPriceFilter(searchParams: {
  minPrice?: string;
  maxPrice?: string;
}): ProductPriceFilter {
  const minPrice = parsePriceQueryParam(searchParams.minPrice);
  const maxPrice = parsePriceQueryParam(searchParams.maxPrice);

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    return { minPrice: maxPrice, maxPrice: minPrice };
  }

  return { minPrice, maxPrice };
}

export function hasProductPriceFilter(filter: ProductPriceFilter): boolean {
  return filter.minPrice != null || filter.maxPrice != null;
}

export function matchesProductPriceFilter(
  priceToman: number,
  filter: ProductPriceFilter,
): boolean {
  if (filter.minPrice != null && priceToman < filter.minPrice) {
    return false;
  }
  if (filter.maxPrice != null && priceToman > filter.maxPrice) {
    return false;
  }
  return true;
}

export function filterProductsByPrice<T extends Pick<ProductSummary, 'priceToman'>>(
  products: T[],
  filter: ProductPriceFilter,
): T[] {
  if (!hasProductPriceFilter(filter)) {
    return products;
  }
  return products.filter((product) => matchesProductPriceFilter(product.priceToman, filter));
}

export function getBudgetListingMeta(filter: ProductPriceFilter): ProductListingPageMeta | null {
  if (!hasProductPriceFilter(filter)) {
    return null;
  }

  const knownRange = HOME_BUDGET_RANGES.find((range) => {
    const url = new URL(range.href, 'http://localhost');
    const min = parsePriceQueryParam(url.searchParams.get('minPrice') ?? undefined);
    const max = parsePriceQueryParam(url.searchParams.get('maxPrice') ?? undefined);
    return min === filter.minPrice && max === filter.maxPrice;
  });

  if (knownRange) {
    return {
      title: knownRange.label,
      breadcrumbs: [{ label: 'فروشگاه' }, { label: knownRange.label }],
      subtitle: 'محصولات در بازه بودجه انتخاب‌شده',
    };
  }

  if (filter.minPrice != null && filter.maxPrice != null) {
    return {
      title: `${formatPrice(filter.minPrice)} تا ${formatPrice(filter.maxPrice)} تومان`,
      breadcrumbs: [{ label: 'فروشگاه' }, { label: 'بازه قیمت' }],
      subtitle: 'محصولات در بازه بودجه انتخاب‌شده',
    };
  }

  if (filter.minPrice != null) {
    return {
      title: `از ${formatPrice(filter.minPrice)} تومان`,
      breadcrumbs: [{ label: 'فروشگاه' }, { label: 'بازه قیمت' }],
      subtitle: 'محصولات در بازه بودجه انتخاب‌شده',
    };
  }

  return {
    title: `تا ${formatPrice(filter.maxPrice!)} تومان`,
    breadcrumbs: [{ label: 'فروشگاه' }, { label: 'بازه قیمت' }],
    subtitle: 'محصولات در بازه بودجه انتخاب‌شده',
  };
}
