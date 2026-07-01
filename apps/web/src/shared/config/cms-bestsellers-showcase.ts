import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import { resolveStorefrontProductImageUrl } from '@sadafgold/shared';
import {
  HOME_BESTSELLERS_SHOWCASE,
  HOME_PRODUCT_CAROUSEL_FALLBACK_HOVER_IMAGE,
  type HomeProductCarouselItem,
} from '@/shared/config/storefront-ia';

const MIN_BESTSELLER_PRODUCTS = 7;
const MAX_BESTSELLER_PRODUCTS = 12;

function resolveCarouselHoverImageUrl(imageUrl: string, hoverImageUrl: string): string {
  return hoverImageUrl !== imageUrl ? hoverImageUrl : HOME_PRODUCT_CAROUSEL_FALLBACK_HOVER_IMAGE;
}

export function ensureCarouselHoverImage(item: HomeProductCarouselItem): HomeProductCarouselItem {
  const imageUrl = item.imageUrl.trim();
  const hoverImageUrl = item.hoverImageUrl?.trim();

  if (hoverImageUrl && hoverImageUrl !== imageUrl) {
    return item;
  }

  return { ...item, hoverImageUrl: HOME_PRODUCT_CAROUSEL_FALLBACK_HOVER_IMAGE };
}

export function mapProductToCarouselItem(product: ProductSummary): HomeProductCarouselItem {
  const imageUrl = resolveStorefrontProductImageUrl(product.imageUrl, product.category);
  const hoverImageUrl = resolveStorefrontProductImageUrl(
    product.hoverImageUrl ?? product.imageUrl,
    product.category,
  );

  return {
    id: product.id,
    title: product.title,
    priceToman: product.priceToman,
    weightGram: product.weightGram,
    imageUrl,
    hoverImageUrl: resolveCarouselHoverImageUrl(imageUrl, hoverImageUrl),
    href: `/products/${product.slug}`,
  };
}

export function resolveBestsellersShowcase(
  sections: Pick<CmsHomepageSections, 'bestsellerTitle'>,
  products: ProductSummary[],
): {
  title: string;
  items: HomeProductCarouselItem[];
} {
  const title = sections.bestsellerTitle?.trim() || 'پرفروش‌ترین ها';

  if (products.length >= MIN_BESTSELLER_PRODUCTS) {
    return {
      title,
      items: products
        .slice(0, MAX_BESTSELLER_PRODUCTS)
        .map(mapProductToCarouselItem)
        .map(ensureCarouselHoverImage),
    };
  }

  return { title, items: HOME_BESTSELLERS_SHOWCASE.map(ensureCarouselHoverImage) };
}
