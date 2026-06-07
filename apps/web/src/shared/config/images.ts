/** Local placeholder when no library image is available (not a CMS asset). */
export const PLACEHOLDER_MEDIA_IMAGE = '/images/placeholder-media.svg';

export const DEFAULT_PRODUCT_IMAGE = PLACEHOLDER_MEDIA_IMAGE;

export const CATEGORY_FALLBACK_IMAGES = {
  rings: PLACEHOLDER_MEDIA_IMAGE,
  earrings: PLACEHOLDER_MEDIA_IMAGE,
  bracelets: PLACEHOLDER_MEDIA_IMAGE,
  necklaces: PLACEHOLDER_MEDIA_IMAGE,
  gifts: PLACEHOLDER_MEDIA_IMAGE,
} as const;

export const IMAGE_MAX_RETRIES = 3;
export const IMAGE_RETRY_BASE_MS = 600;
