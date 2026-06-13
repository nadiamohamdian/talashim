import type { ProductSummary } from '@sadafgold/types';
import { CATEGORY_FALLBACK_IMAGES } from '@/shared/config/images';

export type {
  ProductListingBreadcrumb,
  ProductListingPageMeta,
} from '@/shared/config/product-listing-meta';

export {
  PRODUCT_LISTING_CAROUSEL_SLIDES,
  PRODUCT_LISTING_PAGE,
} from '@/shared/config/product-listing-meta';

const DEMO_LISTING_PRICES = [95_000_000, 98_000_000, 112_000_000, 125_000_000, 138_000_000, 165_000_000] as const;

const DEMO_LISTING_CATEGORIES = [
  'ring',
  'ring',
  'bracelet',
  'earring',
  'necklace',
  'wedding_ring',
  'wedding_ring',
  'ring',
] as const;

const DEMO_LISTING_TITLES = [
  'انگشتر زنانه لوکس بیضی',
  'انگشتر کلاسیک طلا',
  'دستبند طلای ۱۸ عیار',
  'گوشواره آذین مدل نجو',
  'گردنبند مینیمال',
  'حلقه ازدواج کلاسیک',
  'حلقه ازدواج eternity',
  'انگشتر نامزدی',
] as const;

export const DEMO_LISTING_SLUGS = [
  'demo',
  'demo-classic-ring',
  'demo-bracelet',
  'demo-earring',
  'demo-necklace',
  'demo-wedding-ring-classic',
  'demo-wedding-ring-eternity',
  'demo-engagement-ring',
] as const;

const DEMO_LISTING_IMAGES = [
  CATEGORY_FALLBACK_IMAGES.rings,
  CATEGORY_FALLBACK_IMAGES.rings,
  CATEGORY_FALLBACK_IMAGES.bracelets,
  CATEGORY_FALLBACK_IMAGES.earrings,
  CATEGORY_FALLBACK_IMAGES.necklaces,
  CATEGORY_FALLBACK_IMAGES.rings,
  CATEGORY_FALLBACK_IMAGES.rings,
  CATEGORY_FALLBACK_IMAGES.rings,
] as const;

export const PRODUCT_LISTING_DEMO_PRODUCTS: ProductSummary[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `listing-demo-${index + 1}`,
    sku: `DEMO-${index + 1}`,
    slug: DEMO_LISTING_SLUGS[index],
    title: DEMO_LISTING_TITLES[index],
    category: DEMO_LISTING_CATEGORIES[index],
    karat: 18,
    weightGram: 0.23,
    makingFeePercent: 24,
    priceToman: DEMO_LISTING_PRICES[index % DEMO_LISTING_PRICES.length],
    compareAtPriceToman: null,
    discountPercent: null,
    discountStartsAt: null,
    discountEndsAt: null,
    imageUrl: DEMO_LISTING_IMAGES[index],
    hoverImageUrl: DEMO_LISTING_IMAGES[index],
    inventory: 3,
    featured: false,
  }),
);
