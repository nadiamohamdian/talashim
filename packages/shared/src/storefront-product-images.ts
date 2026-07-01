export const STOREFRONT_PRODUCT_IMAGES = {
  default: '/images/home/new-arrival-lifestyle.png',
  ring: '/images/categories/rings.png',
  necklace: '/images/home/new-arrival-necklace.png',
  bracelet: '/images/categories/bracelets.png',
  earring: '/images/categories/earrings.png',
  wedding_ring: '/images/home/wedding-ring.png',
  coin: '/images/home/krugerrand-coin.png',
  jewelrySet: '/images/products/jewelry-set-lifestyle.png',
} as const;

export function resolveStorefrontCategoryImage(category?: string | null): string {
  const normalized = (category ?? '').trim().toLowerCase().replace(/-/g, '_');

  if (normalized === 'ring' || normalized === 'rings') {
    return STOREFRONT_PRODUCT_IMAGES.ring;
  }
  if (normalized === 'necklace' || normalized === 'necklaces') {
    return STOREFRONT_PRODUCT_IMAGES.necklace;
  }
  if (normalized === 'bracelet' || normalized === 'bracelets') {
    return STOREFRONT_PRODUCT_IMAGES.bracelet;
  }
  if (normalized === 'earring' || normalized === 'earrings') {
    return STOREFRONT_PRODUCT_IMAGES.earring;
  }
  if (
    normalized === 'wedding_ring' ||
    normalized === 'wedding_rings'
  ) {
    return STOREFRONT_PRODUCT_IMAGES.wedding_ring;
  }
  if (normalized === 'coin' || normalized === 'coins') {
    return STOREFRONT_PRODUCT_IMAGES.coin;
  }
  if (
    normalized === 'set_and_half_set' ||
    normalized === 'set' ||
    normalized === 'sets'
  ) {
    return STOREFRONT_PRODUCT_IMAGES.jewelrySet;
  }

  return STOREFRONT_PRODUCT_IMAGES.default;
}

export function isUnreliableStorefrontProductImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return true;
  }

  return (
    trimmed.includes('seed-placeholder') ||
    trimmed.endsWith('placeholder-media.svg') ||
    trimmed.endsWith('/placeholder-media.svg')
  );
}

export function resolveStorefrontProductImageUrl(
  imageUrl: string | null | undefined,
  category?: string | null,
): string {
  const trimmed = imageUrl?.trim() ?? '';
  if (trimmed && !isUnreliableStorefrontProductImageUrl(trimmed)) {
    return trimmed;
  }

  return resolveStorefrontCategoryImage(category);
}
