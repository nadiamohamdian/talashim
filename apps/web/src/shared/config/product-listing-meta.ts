export interface ProductListingBreadcrumb {
  label: string;
  href?: string;
}

export interface ProductListingPageMeta {
  title: string;
  subtitle?: string;
  breadcrumbs?: readonly ProductListingBreadcrumb[];
}

export const PRODUCT_LISTING_PAGE: ProductListingPageMeta = {
  title: 'گوشواره',
  breadcrumbs: [{ label: 'زنانه' }, { label: 'گوشواره' }],
};

export const PRODUCT_LISTING_CAROUSEL_SLIDES = [
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
  '/images/products/listing-hero-1.png',
] as const;
