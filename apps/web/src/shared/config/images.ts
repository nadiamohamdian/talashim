/** Reliable fallback when remote product images fail after retries. */
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80';

export const CATEGORY_FALLBACK_IMAGES = {
  rings:
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  earrings:
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  bracelets:
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
  necklaces:
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  gifts:
    'https://images.unsplash.com/photo-1603561596117-0a71b1f9226a?auto=format&fit=crop&w=600&q=80',
} as const;

export const IMAGE_MAX_RETRIES = 3;
export const IMAGE_RETRY_BASE_MS = 600;
