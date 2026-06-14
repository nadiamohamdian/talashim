import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import {
  HOME_BESTSELLERS_SHOWCASE,
  type HomeProductCarouselItem,
} from '@/shared/config/storefront-ia';

const MIN_BESTSELLER_PRODUCTS = 7;
const MAX_BESTSELLER_PRODUCTS = 12;

export function mapProductToCarouselItem(product: ProductSummary): HomeProductCarouselItem {
  return {
    id: product.id,
    title: product.title,
    priceToman: product.priceToman,
    weightGram: product.weightGram,
    imageUrl: product.imageUrl,
    hoverImageUrl: product.hoverImageUrl?.trim() || undefined,
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
  const title = sections.bestsellerTitle?.trim() || 'پرفروش‌ترین‌ها';

  if (products.length >= MIN_BESTSELLER_PRODUCTS) {
    return {
      title,
      items: products.slice(0, MAX_BESTSELLER_PRODUCTS).map(mapProductToCarouselItem),
    };
  }

  return { title, items: [...HOME_BESTSELLERS_SHOWCASE] };
}
