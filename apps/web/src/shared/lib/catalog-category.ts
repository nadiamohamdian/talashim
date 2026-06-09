import type { ProductSummary } from '@sadafgold/types';
import type { ProductListingPageMeta } from '@/shared/config/product-listing-meta';

/** Maps storefront slugs to API / Prisma category keys. */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  ring: 'ring',
  rings: 'ring',
  necklace: 'necklace',
  necklaces: 'necklace',
  bracelet: 'bracelet',
  bracelets: 'bracelet',
  earring: 'earring',
  earrings: 'earring',
  coin: 'coin',
  coins: 'coin',
};

const CATEGORY_META: Record<string, { parent: string; title: string }> = {
  ring: { parent: 'زنانه', title: 'انگشتر' },
  necklace: { parent: 'زنانه', title: 'گردنبند' },
  bracelet: { parent: 'زنانه', title: 'دستبند' },
  earring: { parent: 'زنانه', title: 'گوشواره' },
  coin: { parent: 'سرمایه‌گذاری', title: 'سکه' },
};

export function resolveCatalogCategorySlug(slug: string | undefined | null): string | undefined {
  if (!slug?.trim()) {
    return undefined;
  }
  return CATEGORY_SLUG_MAP[slug.trim().toLowerCase()];
}

export function normalizeProductCategory(category: string): string {
  return category.trim().toLowerCase();
}

export function matchesCatalogCategory(productCategory: string, categorySlug: string): boolean {
  const resolved = resolveCatalogCategorySlug(categorySlug);
  if (!resolved) {
    return false;
  }
  return normalizeProductCategory(productCategory) === resolved;
}

export function filterProductsByCategory<T extends Pick<ProductSummary, 'category'>>(
  products: T[],
  categorySlug: string,
): T[] {
  const resolved = resolveCatalogCategorySlug(categorySlug);
  if (!resolved) {
    return [];
  }
  return products.filter((product) => normalizeProductCategory(product.category) === resolved);
}

export function getCategoryListingMeta(categorySlug: string): ProductListingPageMeta | null {
  const resolved = resolveCatalogCategorySlug(categorySlug);
  if (!resolved) {
    return null;
  }
  const meta = CATEGORY_META[resolved];
  if (!meta) {
    return { title: categorySlug };
  }
  return {
    title: meta.title,
    breadcrumbs: [{ label: meta.parent }, { label: meta.title }],
    subtitle: `محصولات ${meta.title}`,
  };
}
