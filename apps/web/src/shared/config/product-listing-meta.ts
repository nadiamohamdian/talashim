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
  title: 'گوشواره زنانه',
  subtitle: 'خرید گوشواره طلا با ضمانت اصالت و ارسال سریع',
};

export const PRODUCT_LISTING_CAROUSEL_SLIDES = [
  '/images/products/listing-hero-1.png',
  '/images/products/jewelry-set-lifestyle.png',
  '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png',
  '/images/home/lens-product-ring.png',
] as const;
