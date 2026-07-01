import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import { HOME_NEW_ARRIVALS_SHOWCASE, type HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import {
  ensureCarouselHoverImage,
  mapProductToCarouselItem,
} from '@/shared/config/cms-bestsellers-showcase';

const MIN_NEW_ARRIVALS_PRODUCTS = 1;
const MAX_NEW_ARRIVALS_PRODUCTS = 12;

export function resolveNewArrivalsShowcase(
  sections: Pick<CmsHomepageSections, 'newArrivalsTitle'>,
  products: ProductSummary[],
): {
  title: string;
  items: HomeProductCarouselItem[];
} {
  const title = sections.newArrivalsTitle?.trim() || 'جدیدترین ها';

  if (products.length >= MIN_NEW_ARRIVALS_PRODUCTS) {
    return {
      title,
      items: products
        .slice(0, MAX_NEW_ARRIVALS_PRODUCTS)
        .map(mapProductToCarouselItem)
        .map(ensureCarouselHoverImage),
    };
  }

  return {
    title,
    items: HOME_NEW_ARRIVALS_SHOWCASE.map(ensureCarouselHoverImage),
  };
}
