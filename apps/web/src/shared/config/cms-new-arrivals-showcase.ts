import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import {
  HOME_NEW_ARRIVALS_SHOWCASE,
  type HomeProductCarouselItem,
} from '@/shared/config/storefront-ia';
import { mapProductToCarouselItem } from '@/shared/config/cms-bestsellers-showcase';

const MIN_NEW_ARRIVALS_PRODUCTS = 1;
const MAX_NEW_ARRIVALS_PRODUCTS = 12;
const TEMP_NEW_ARRIVALS_HOVER_IMAGE =
  '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png';
const TEMP_NEW_ARRIVALS_TARGET_INDICES = new Set([4, 5]);

function applyTemporaryHoverImages(items: HomeProductCarouselItem[]): HomeProductCarouselItem[] {
  return items.map((item, index) =>
    TEMP_NEW_ARRIVALS_TARGET_INDICES.has(index)
      ? { ...item, hoverImageUrl: TEMP_NEW_ARRIVALS_HOVER_IMAGE }
      : item,
  );
}

export function resolveNewArrivalsShowcase(
  sections: Pick<CmsHomepageSections, 'newArrivalsTitle'>,
  products: ProductSummary[],
): {
  title: string;
  items: HomeProductCarouselItem[];
} {
  const title = sections.newArrivalsTitle?.trim() || 'جدیدترین ها';

  if (products.length >= MIN_NEW_ARRIVALS_PRODUCTS) {
    const cmsItems = products.slice(0, MAX_NEW_ARRIVALS_PRODUCTS).map(mapProductToCarouselItem);
    return {
      title,
      items: applyTemporaryHoverImages(cmsItems),
    };
  }

  return { title, items: applyTemporaryHoverImages([...HOME_NEW_ARRIVALS_SHOWCASE]) };
}
