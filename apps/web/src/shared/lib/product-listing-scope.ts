import type { ProductSummary, ProductType } from '@sadafgold/types';
import { normalizeProductCategory } from '@/shared/lib/catalog-category';

import type { CatalogCategoryFilterConfig } from '@sadafgold/types';
import { DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS } from '@sadafgold/shared';
import { GIFT_BUDGET_RANGES } from '@/shared/config/storefront-ia';
import { parsePriceQueryParam } from '@/shared/lib/product-price-filter';

const JEWELRY_CATEGORIES = new Set([
  'ring',
  'necklace',
  'bracelet',
  'earring',
  'wedding_ring',
  'set',
]);

const COIN_CATEGORIES = new Set(['coin']);

export function parseProductListingType(
  value: string | undefined | null,
): ProductType | undefined {
  const normalized = value?.trim();
  if (
    normalized === 'melted_gold' ||
    normalized === 'gold_jewelry' ||
    normalized === 'coins' ||
    normalized === 'investment_gold' ||
    normalized === 'wholesale'
  ) {
    return normalized;
  }
  return undefined;
}

export function isKidsListingCategory(categorySlug: string | undefined | null): boolean {
  return categorySlug?.trim().toLowerCase() === 'kids';
}

export function isKidsProduct(product: Pick<ProductSummary, 'slug' | 'title'>): boolean {
  const slug = product.slug.toLowerCase();
  const title = product.title;
  return slug.includes('kids') || slug.includes('koodak') || /کودک/u.test(title);
}

export function isGiftProduct(product: Pick<ProductSummary, 'slug' | 'title'>): boolean {
  const slug = product.slug.toLowerCase();
  const title = product.title;
  return slug.includes('gift') || /هدیه/u.test(title);
}

export function filterProductsByKids<T extends Pick<ProductSummary, 'slug' | 'title'>>(
  products: T[],
): T[] {
  return products.filter(isKidsProduct);
}

export function filterProductsByGift<T extends Pick<ProductSummary, 'slug' | 'title'>>(
  products: T[],
): T[] {
  return products.filter(isGiftProduct);
}

export function filterProductsByProductType<T extends Pick<ProductSummary, 'category'>>(
  products: T[],
  productType: ProductType,
): T[] {
  return products.filter((product) => {
    const category = normalizeProductCategory(product.category);
    switch (productType) {
      case 'gold_jewelry':
        return JEWELRY_CATEGORIES.has(category);
      case 'coins':
        return COIN_CATEGORIES.has(category);
      case 'investment_gold':
        return COIN_CATEGORIES.has(category);
      case 'melted_gold':
      case 'wholesale':
        return false;
      default:
        return true;
    }
  });
}

export function buildGiftListingFilterConfig(): CatalogCategoryFilterConfig {
  return {
    sortOptions: DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS.map((option) => ({ ...option })),
    filterSections: [
      {
        id: 'gift-budget',
        title: 'بودجه هدیه',
        options: GIFT_BUDGET_RANGES.map((range) => {
          const url = new URL(range.href, 'http://localhost');
          return {
            id: range.id,
            label: range.label,
            minPrice: parsePriceQueryParam(url.searchParams.get('minPrice') ?? undefined),
            maxPrice: parsePriceQueryParam(url.searchParams.get('maxPrice') ?? undefined),
          };
        }),
      },
    ],
  };
}
