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

export function mapLensVideoToShowcaseItem(video: PublicCmsLensVideo): LensShowcaseDemoItem {
  return {
    id: video.id,
    title: video.title,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? '',
    sortOrder: video.sortOrder,
    products: (video.products ?? [])
      .map(mapProduct)
      .filter((product): product is LensShowcaseProductVariant => product != null),
  };
}

export function resolveLensSetsShowcaseItems(
  videos: PublicCmsLensVideo[],
): LensShowcaseDemoItem[] {
  if (videos.length === 0) {
    return [...LENS_SHOWCASE_DEMO_ITEMS];
  }

  return videos.map(mapLensVideoToShowcaseItem);
}

export function resolveLensCarouselItems(videos: PublicCmsLensVideo[]): LensShowcaseDemoItem[] {
  if (videos.length === 0) {
    return [...LENS_CAROUSEL_DEMO_ITEMS];
  }

  return videos.map(mapLensVideoToShowcaseItem);
}
