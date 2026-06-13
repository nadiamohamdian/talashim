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

const DEMO_EARRING_IMAGE = CATEGORY_FALLBACK_IMAGES.earrings;

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

export const PRODUCT_LISTING_DEMO_PRODUCTS: ProductSummary[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `listing-demo-${index + 1}`,
    sku: `DEMO-${index + 1}`,
    slug: index === 0 ? 'demo' : index === 1 ? 'demo-jewelry-set' : 'demo',
    title: DEMO_LISTING_TITLES[index % DEMO_LISTING_TITLES.length],
    category: DEMO_LISTING_CATEGORIES[index % DEMO_LISTING_CATEGORIES.length],
    karat: 18,
    weightGram: 0.23,
    makingFeePercent: 24,
    priceToman: DEMO_LISTING_PRICES[index % DEMO_LISTING_PRICES.length],
    compareAtPriceToman: null,
    discountPercent: null,
    discountStartsAt: null,
    discountEndsAt: null,
    imageUrl: DEMO_EARRING_IMAGE,
    hoverImageUrl: DEMO_EARRING_IMAGE,
    inventory: 3,
    featured: false,
  }),
);
