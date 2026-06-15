import { resolveCatalogCategorySlug } from '@/shared/lib/catalog-category';

/** Figma node 2072:12937 — category hero gallery slides per catalog category */
export const CATEGORY_LISTING_GALLERY: Record<string, readonly string[]> = {
  ring: [
    '/images/products/listing-hero-1.png',
    '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png',
    '/images/products/jewelry-set-lifestyle.png',
    '/images/home/lens-product-ring.png',
  ],
  necklace: [
    '/images/home/new-arrival-necklace.png',
    '/images/categories/71204743576e384a1b000507bf12a9ea%201.png',
    '/images/products/a3eb1243002467eaa8beb1676880561c%201.png',
    '/images/home/hero-carousel-necklace.png',
  ],
  bracelet: [
    '/images/categories/bracelets.png',
    '/images/home/hero-carousel-bracelet.png',
    '/images/home/VintageKnotAdjustableBracelet1_720x%202.png',
    '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png',
  ],
  earring: [
    '/images/categories/earrings.png',
    '/images/home/hero-carousel-necklace.png',
    '/images/products/2dea02c00d5841c3c694c877cf9c063f%20(1)%201.png',
    '/images/products/1fa9ec70dc7f4bfd7e1b36f99e61650c%202.png',
  ],
  wedding_ring: [
    '/images/home/wedding-ring.png',
    '/images/products/listing-hero-1.png',
    '/images/home/Group%20386.png',
    '/images/products/jewelry-set-lifestyle.png',
  ],
  coin: [
    '/images/categories/rings.png',
    '/images/products/listing-hero-1.png',
    '/images/products/pdp-hero.png',
    '/images/products/jewelry-set-lifestyle.png',
  ],
  set: [
    '/images/products/jewelry-set-lifestyle.png',
    '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png',
    '/images/home/hero-carousel-ring.png',
    '/images/home/hero-carousel-necklace.png',
  ],
};

const DEFAULT_CATEGORY_GALLERY_SLIDES = CATEGORY_LISTING_GALLERY.ring;

export function getCategoryListingGallerySlides(
  categorySlug: string,
): readonly string[] | undefined {
  const resolved = resolveCatalogCategorySlug(categorySlug);
  if (!resolved) {
    return undefined;
  }

  return CATEGORY_LISTING_GALLERY[resolved] ?? DEFAULT_CATEGORY_GALLERY_SLIDES;
}
