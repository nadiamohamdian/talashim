import type { ProductSummary, PublicCmsLensVideo } from '@sadafgold/types';
import {
  LENS_CAROUSEL_DEMO_ITEMS,
  LENS_SHOWCASE_DEMO_ITEMS,
  type LensShowcaseDemoItem,
  type LensShowcaseProductVariant,
} from '@/shared/config/lens-showcase-demo';

function mapProduct(product: ProductSummary): LensShowcaseProductVariant | null {
  const slug = product.slug?.trim();
  if (!slug) {
    return null;
  }

  return {
    id: product.id,
    slug,
    title: product.title,
    priceToman: product.priceToman,
    weightGram: product.weightGram,
    imageUrl: product.imageUrl,
  };
}

function resolveLensProducts(
  products: ProductSummary[],
  fallbackIndex: number,
): LensShowcaseProductVariant[] {
  const mapped = products
    .map(mapProduct)
    .filter((product): product is LensShowcaseProductVariant => product != null);

  if (mapped.length > 0) {
    return mapped;
  }

  const fallbackItem =
    LENS_SHOWCASE_DEMO_ITEMS[fallbackIndex] ??
    LENS_CAROUSEL_DEMO_ITEMS[fallbackIndex] ??
    LENS_SHOWCASE_DEMO_ITEMS[0];

  return fallbackItem?.products ?? [];
}

export function mapLensVideoToShowcaseItem(
  video: PublicCmsLensVideo,
  fallbackIndex = 0,
): LensShowcaseDemoItem {
  return {
    id: video.id,
    title: video.title,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? '',
    heroImageUrl: video.heroImageUrl,
    hotspots: video.hotspots?.length ? video.hotspots : undefined,
    sortOrder: video.sortOrder,
    products: resolveLensProducts(video.products ?? [], fallbackIndex),
  };
}

export function resolveLensSetsShowcaseItems(
  videos: PublicCmsLensVideo[],
): LensShowcaseDemoItem[] {
  if (videos.length === 0) {
    return [...LENS_SHOWCASE_DEMO_ITEMS];
  }

  return videos.map((video, index) => mapLensVideoToShowcaseItem(video, index));
}

export function resolveLensCarouselItems(videos: PublicCmsLensVideo[]): LensShowcaseDemoItem[] {
  if (videos.length === 0) {
    return [...LENS_CAROUSEL_DEMO_ITEMS];
  }

  return videos.map((video, index) => mapLensVideoToShowcaseItem(video, index));
}
