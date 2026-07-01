/** Storefront category slug → canonical product category key. */
export const CATALOG_CATEGORY_SLUG_MAP: Record<string, string> = {
  ring: 'ring',
  rings: 'ring',
  necklace: 'necklace',
  necklaces: 'necklace',
  bracelet: 'bracelet',
  bracelets: 'bracelet',
  earring: 'earring',
  earrings: 'earring',
  set: 'set_and_half_set',
  sets: 'set_and_half_set',
  'half-set': 'set_and_half_set',
  half_set: 'set_and_half_set',
  coin: 'coin',
  coins: 'coin',
  'wedding-ring': 'wedding_ring',
  'wedding-rings': 'wedding_ring',
  wedding_ring: 'wedding_ring',
  wedding_rings: 'wedding_ring',
  kids: 'children',
  children: 'children',
};

const PRISMA_CATEGORY_SLUG_MAP: Record<string, string> = {
  ring: 'ring',
  necklace: 'necklace',
  bracelet: 'bracelet',
  earring: 'earring',
  coin: 'coin',
  wedding_ring: 'wedding_ring',
  children: 'children',
  set_and_half_set: 'set_and_half_set',
};

export function resolveCatalogCategoryKey(
  slug: string | undefined | null,
): string | undefined {
  if (!slug?.trim()) {
    return undefined;
  }

  return CATALOG_CATEGORY_SLUG_MAP[slug.trim().toLowerCase()];
}

export function normalizeStorefrontProductCategory(category: string): string {
  const normalized = category.trim().toLowerCase();
  return PRISMA_CATEGORY_SLUG_MAP[normalized] ?? normalized;
}

export function isVirtualCatalogCategory(categoryKey: string | undefined): boolean {
  return categoryKey === 'set';
}

/** Query param for GET /catalog — undefined for virtual categories (set/kids). */
export function resolveCatalogApiCategoryQuery(
  categoryParam?: string | null,
  productCategory?: string | null,
): string | undefined {
  const fromParam = categoryParam?.trim();
  if (fromParam) {
    const key = resolveCatalogCategoryKey(fromParam);
    if (key && isVirtualCatalogCategory(key)) {
      return undefined;
    }
    return fromParam;
  }

  const mappedCategory = productCategory?.trim();
  if (!mappedCategory) {
    return undefined;
  }

  const key = normalizeStorefrontProductCategory(mappedCategory);
  if (isVirtualCatalogCategory(key)) {
    return undefined;
  }

  if (key === 'wedding_ring') {
    return 'wedding-ring';
  }

  if (key === 'set_and_half_set') {
    return 'sets';
  }

  return key;
}

export const CATALOG_LISTING_CATEGORY_SLUGS = [
  'rings',
  'necklaces',
  'bracelets',
  'earrings',
  'sets',
  'wedding-rings',
  'coins',
  'kids',
] as const;
