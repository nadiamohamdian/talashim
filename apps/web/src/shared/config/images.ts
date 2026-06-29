import { STOREFRONT_PRODUCT_IMAGES } from '@sadafgold/shared';

/** Local placeholder when no library image is available (not a CMS asset). */
export const PLACEHOLDER_MEDIA_IMAGE = STOREFRONT_PRODUCT_IMAGES.default;

export const DEFAULT_PRODUCT_IMAGE = PLACEHOLDER_MEDIA_IMAGE;

export const CATEGORY_FALLBACK_IMAGES = {
  rings: STOREFRONT_PRODUCT_IMAGES.ring,
  earrings: STOREFRONT_PRODUCT_IMAGES.earring,
  bracelets: STOREFRONT_PRODUCT_IMAGES.bracelet,
  necklaces: STOREFRONT_PRODUCT_IMAGES.necklace,
  gifts: STOREFRONT_PRODUCT_IMAGES.default,
} as const;

export const IMAGE_MAX_RETRIES = 3;
export const IMAGE_RETRY_BASE_MS = 600;
