import type { ProductSummary } from '@sadafgold/types';
import { CATALOG_DEMO_PRODUCTS } from '@talashim/shared/constants/demo-products';
import { CATEGORY_FALLBACK_IMAGES } from '@/shared/config/images';

export type {
  ProductListingBreadcrumb,
  ProductListingPageMeta,
} from '@/shared/config/product-listing-meta';

export {
  PRODUCT_LISTING_CAROUSEL_SLIDES,
  PRODUCT_LISTING_PAGE,
} from '@/shared/config/product-listing-meta';

export const DEMO_LISTING_SLUGS = CATALOG_DEMO_PRODUCTS.map((product) => product.slug);

export const PRODUCT_LISTING_DEMO_PRODUCTS: ProductSummary[] = CATALOG_DEMO_PRODUCTS.map(
  (item) => ({
    id: `listing-${item.slug}`,
    sku: item.sku,
    slug: item.slug,
    title: item.title,
    category: item.category,
    karat: item.karat,
    weightGram: item.weightGram,
    makingFeePercent: item.makingFeePercent,
    priceToman: item.priceToman,
    compareAtPriceToman: null,
    discountPercent: null,
    discountStartsAt: null,
    discountEndsAt: null,
    imageUrl: item.storefrontImagePath,
    hoverImageUrl: item.storefrontImagePath,
    inventory: item.inventory,
    featured: item.featured,
  }),
);

/** @deprecated Use CATALOG_DEMO_PRODUCTS from @talashim/shared */
export const DEMO_LISTING_IMAGES = {
  rings: CATEGORY_FALLBACK_IMAGES.rings,
  bracelets: CATEGORY_FALLBACK_IMAGES.bracelets,
  earrings: CATEGORY_FALLBACK_IMAGES.earrings,
  necklaces: CATEGORY_FALLBACK_IMAGES.necklaces,
} as const;
