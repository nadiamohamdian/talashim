import type { CmsHeroConfig } from '@sadafgold/types';
import type { ProductSummary } from '@sadafgold/types';
import { resolveStorefrontProductImageUrl } from '@sadafgold/shared';
import {
  HOME_HERO_DESKTOP_CAROUSEL,
  HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT,
  type HomeHeroDesktopCarouselItem,
} from '@/shared/config/storefront-ia';

function mapCmsCarouselItems(
  items: CmsHeroConfig['desktopCarouselItems'],
): HomeHeroDesktopCarouselItem[] {
  return (
    items
      ?.filter((item) => item.imageUrl.trim().length > 0)
      .map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl.trim(),
        href: item.href.trim() || '/products',
      })) ?? []
  );
}

function mapProductCarouselItems(products: ProductSummary[]): HomeHeroDesktopCarouselItem[] {
  const seen = new Set<string>();
  const mapped: HomeHeroDesktopCarouselItem[] = [];

  for (const product of products) {
    const imageUrl = resolveStorefrontProductImageUrl(product.imageUrl, product.category);
    if (!imageUrl || seen.has(product.id)) {
      continue;
    }

    seen.add(product.id);
    mapped.push({
      id: product.id,
      imageUrl,
      href: `/products/${product.slug}`,
    });
  }

  return mapped;
}

function fillCarouselToVisibleCount(
  items: HomeHeroDesktopCarouselItem[],
): HomeHeroDesktopCarouselItem[] {
  const merged = [...items];

  for (const fallback of HOME_HERO_DESKTOP_CAROUSEL) {
    if (merged.length >= HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT) {
      break;
    }

    if (!merged.some((entry) => entry.id === fallback.id)) {
      merged.push(fallback);
    }
  }

  return merged.slice(0, HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT);
}

export function resolveHeroDesktopCarouselItems(
  cmsItems: CmsHeroConfig['desktopCarouselItems'],
  products: ProductSummary[],
): HomeHeroDesktopCarouselItem[] {
  const configured = mapCmsCarouselItems(cmsItems);
  if (configured.length > 0) {
    return configured;
  }

  const fromProducts = mapProductCarouselItems(products);
  return fillCarouselToVisibleCount(fromProducts);
}
