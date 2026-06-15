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
  set: 'set',
  sets: 'set',
  'half-set': 'set',
  half_set: 'set',
  coin: 'coin',
  coins: 'coin',
  'wedding-ring': 'wedding_ring',
  'wedding-rings': 'wedding_ring',
  wedding_ring: 'wedding_ring',
  wedding_rings: 'wedding_ring',
};

const CATEGORY_META: Record<string, { parent: string; title: string; subtitle: string }> = {
  ring: {
    parent: 'زنانه',
    title: 'انگشتر زنانه',
    subtitle: 'خرید انگشتر طلا با ضمانت اصالت و ارسال سریع',
  },
  necklace: {
    parent: 'زنانه',
    title: 'گردنبند زنانه',
    subtitle: 'خرید گردنبند طلا با ضمانت اصالت و ارسال سریع',
  },
  bracelet: {
    parent: 'زنانه',
    title: 'دستبند زنانه',
    subtitle: 'خرید دستبند طلا با ضمانت اصالت و ارسال سریع',
  },
  earring: {
    parent: 'زنانه',
    title: 'گوشواره زنانه',
    subtitle: 'خرید گوشواره طلا با ضمانت اصالت و ارسال سریع',
  },
  coin: {
    parent: 'سرمایه‌گذاری',
    title: 'سکه',
    subtitle: 'خرید سکه طلا با ضمانت اصالت و ارسال سریع',
  },
  wedding_ring: {
    parent: 'ازدواج',
    title: 'حلقه ازدواج',
    subtitle: 'خرید حلقه ازدواج طلا با ضمانت اصالت و ارسال سریع',
  },
  set: {
    parent: 'زنانه',
    title: 'ست و نیم‌ست زنانه',
    subtitle: 'خرید ست و نیم‌ست طلا با ضمانت اصالت و ارسال سریع',
  },
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

export type ProductJewelrySizeKind = 'ring' | 'necklace' | 'bracelet';

const JEWELRY_SIZE_ITEM_PATTERNS: ReadonlyArray<{
  kind: ProductJewelrySizeKind;
  pattern: RegExp;
}> = [
  { kind: 'ring', pattern: /انگشتر|حلقه/u },
  { kind: 'necklace', pattern: /گردنبند|آویز|پلاک|زنجیر/u },
  { kind: 'bracelet', pattern: /دستبند|النگو|بازوبند/u },
];

const SET_SPEC_LABEL_PATTERN = /قطعات\s*(?:نیم[\s‌-]?)?ست|محتویات\s*ست|اقلام\s*ست/u;

const SET_TITLE_PATTERNS: RegExp[] = [
  /نیم[\s‌-]?ست/u,
  /ست\s+(?:زیور|طلای|جواهر|طلایی)/u,
  /(?:زیورآلات|زیور)\s+ست/u,
  /half[\s-]?set/i,
  /\bset\b/i,
];

const SET_SLUG_PATTERNS: RegExp[] = [/\bset\b/i, /nim-set/i, /نیم-ست/u];

export interface ProductJewelrySizeSource {
  title: string;
  slug: string;
  category: string;
  description?: string;
  specifications?: Record<string, string>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSetItemTextCorpus(product: ProductJewelrySizeSource): string {
  const specificationText = Object.entries(product.specifications ?? {})
    .map(([label, value]) => `${label} ${value}`)
    .join(' ');

  return [
    product.title,
    stripHtml(product.description ?? ''),
    specificationText,
  ]
    .filter(Boolean)
    .join(' ');
}

function detectSizeKindsFromText(text: string): ProductJewelrySizeKind[] {
  const kinds: ProductJewelrySizeKind[] = [];

  for (const { kind, pattern } of JEWELRY_SIZE_ITEM_PATTERNS) {
    if (pattern.test(text)) {
      kinds.push(kind);
    }
  }

  return kinds;
}

function uniqueSizeKinds(kinds: ProductJewelrySizeKind[]): ProductJewelrySizeKind[] {
  const order: ProductJewelrySizeKind[] = ['ring', 'necklace', 'bracelet'];
  return order.filter((kind) => kinds.includes(kind));
}

export function isJewelrySetOrHalfSetProduct(product: ProductJewelrySizeSource): boolean {
  const normalized = normalizeProductCategory(product.category);
  const resolved = resolveCatalogCategorySlug(normalized) ?? normalized;
  if (resolved === 'set') {
    return true;
  }

  const title = product.title.trim();
  const slug = product.slug.trim().toLowerCase();

  if (SET_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
    return true;
  }

  if (SET_SLUG_PATTERNS.some((pattern) => pattern.test(slug))) {
    return true;
  }

  for (const [label, value] of Object.entries(product.specifications ?? {})) {
    if (SET_SPEC_LABEL_PATTERN.test(label) || SET_SPEC_LABEL_PATTERN.test(value)) {
      return true;
    }
  }

  return false;
}

/** Maps product category to the jewelry size selector shown on PDP. */
export function resolveProductJewelrySizeKind(
  category: string | undefined | null,
): ProductJewelrySizeKind | null {
  if (!category?.trim()) {
    return null;
  }

  const normalized = normalizeProductCategory(category);
  const resolved = resolveCatalogCategorySlug(normalized) ?? normalized;

  switch (resolved) {
    case 'ring':
    case 'wedding_ring':
      return 'ring';
    case 'necklace':
      return 'necklace';
    case 'bracelet':
      return 'bracelet';
    default:
      return null;
  }
}

/** Returns all jewelry size selectors needed for a product (multi-select for sets). */
export function resolveProductJewelrySizeKinds(
  product: ProductJewelrySizeSource,
): ProductJewelrySizeKind[] {
  if (isJewelrySetOrHalfSetProduct(product)) {
    const detected = detectSizeKindsFromText(buildSetItemTextCorpus(product));
    if (detected.length > 0) {
      return uniqueSizeKinds(detected);
    }

    return ['ring', 'necklace', 'bracelet'];
  }

  const single = resolveProductJewelrySizeKind(product.category);
  return single ? [single] : [];
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
    subtitle: meta.subtitle,
  };
}
