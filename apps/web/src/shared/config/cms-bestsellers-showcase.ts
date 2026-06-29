import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import { resolveStorefrontProductImageUrl } from '@sadafgold/shared';
import {
  HOME_BESTSELLERS_SHOWCASE,
  type HomeProductCarouselItem,
} from '@/shared/config/storefront-ia';

const MIN_BESTSELLER_PRODUCTS = 7;
const MAX_BESTSELLER_PRODUCTS = 12;

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
    hoverImageUrl: hoverImageUrl !== imageUrl ? hoverImageUrl : undefined,
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
      items: products.slice(0, MAX_BESTSELLER_PRODUCTS).map(mapProductToCarouselItem),
    };
  }

  return { title, items: [...HOME_BESTSELLERS_SHOWCASE] };
}
