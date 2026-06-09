import type { ProductSummary } from '@sadafgold/types';

export interface ProductListingPageMeta {
  title: string;
  subtitle: string;
}

export const PRODUCT_LISTING_PAGE: ProductListingPageMeta = {
  title: 'انگشتر زنانه',
  subtitle: 'خرید انگشتر طلا با ضمانت اصالت و ارسال سریع',
};

export const PRODUCT_LISTING_CAROUSEL_SLIDES = [
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
] as const;

const DEMO_RING_IMAGE = '/images/categories/rings.png';

export const PRODUCT_LISTING_DEMO_PRODUCTS: ProductSummary[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `listing-demo-${index + 1}`,
    sku: `RNG-DEMO-${index + 1}`,
    slug: index === 0 ? 'demo' : index === 1 ? 'demo-jewelry-set' : 'demo',
    title: 'انگشتر زنانه لوکس بیضی',
    category: 'ring',
    karat: 18,
    weightGram: 2.8,
    makingFeePercent: 24,
    priceToman: 8_500_000,
    compareAtPriceToman: null,
    discountPercent: null,
    discountStartsAt: null,
    discountEndsAt: null,
    imageUrl: DEMO_RING_IMAGE,
    hoverImageUrl: DEMO_RING_IMAGE,
    inventory: 3,
    featured: false,
  }),
);
