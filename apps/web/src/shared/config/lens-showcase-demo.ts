/** Demo lens videos + linked product variants — until CMS lens API is wired */
import {
  LENS_SHOWCASE_ARTBOARD,
  scaleLensPositionToPercent,
} from '@sadafgold/shared';

export interface LensShowcaseProductVariant {
  id: string;
  slug: string;
  title: string;
  priceToman: number;
  weightGram: number;
  imageUrl: string;
}

export function getLensProductPageHref(slug: string): string {
  const normalized = slug.trim();
  if (!normalized) {
    return '/products';
  }

  return `/products/${encodeURIComponent(normalized)}`;
}

export interface LensShowcaseDemoItem {
  id: string;
  title: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  heroImageUrl?: string | null;
  hotspots?: LensHotspot[];
  sortOrder: number;
  products: LensShowcaseProductVariant[];
}

export interface LensHotspot {
  id?: string;
  top: string;
  left: string;
  topMobile?: string;
  leftMobile?: string;
  chipTop?: string;
  chipLeft?: string;
  chipTopMobile?: string;
  chipLeftMobile?: string;
  chipTranslateX?: string;
  chipTranslateY?: string;
}

/** Figma artboard — must match storefront CSS (--ls-art-hero-w/h) and admin CMS editor */
export const LENS_HERO_ARTBOARD = LENS_SHOWCASE_ARTBOARD;

export { scaleLensPositionToPercent };

export function resolveLensHotspotPosition(
  spot: LensHotspot,
  isMobile: boolean,
): { top: string; left: string } {
  if (isMobile) {
    return {
      top: spot.topMobile ?? spot.top,
      left: spot.leftMobile ?? spot.left,
    };
  }

  return {
    top: spot.top,
    left: spot.left,
  };
}

export function resolveLensChipPosition(
  spot: LensHotspot,
  isMobile: boolean,
): { top: string; left: string } {
  if (isMobile) {
    return {
      top: spot.chipTopMobile ?? spot.chipTop ?? spot.topMobile ?? spot.top,
      left: spot.chipLeftMobile ?? spot.chipLeft ?? spot.leftMobile ?? spot.left,
    };
  }

  return {
    top: spot.chipTop ?? spot.top,
    left: spot.chipLeft ?? spot.left,
  };
}

const DEMO_LENS_PRODUCTS: LensShowcaseProductVariant[] = [
  {
    id: 'lens-product-1',
    slug: 'royal-ring',
    title: 'انگشتر زنانه لوکس بیضی',
    priceToman: 8_500_000,
    weightGram: 2.8,
    imageUrl: '/images/home/lens-product-ring.png',
  },
  {
    id: 'lens-product-2',
    slug: 'van-cleef-alhambra-ring',
    title: 'گوشواره طلای ۱۸ عیار',
    priceToman: 12_400_000,
    weightGram: 3.2,
    imageUrl: '/images/categories/earrings.png',
  },
  {
    id: 'lens-product-3',
    slug: 'talashim-necklace',
    title: 'دستبند زنجیری ظریف',
    priceToman: 9_750_000,
    weightGram: 4.1,
    imageUrl: '/images/categories/bracelets.png',
  },
];

const DEMO_LENS_POSTER = '/images/home/lens-demo-poster.png';
export const LENS_EDITORIAL_HERO =
  '/images/home/9c4dd67d8f1d19b4e88be95aa15037b4%202.png';

/** Development fallback until CMS lens videos are published */
export const LENS_DEMO_VIDEO_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm';

export const LENS_EDITORIAL_META = {
  eyebrow: 'Talashim Lens',
  title: 'ست‌ها از نمای نزدیک',
  description:
    'از نیم‌ست‌های ظریف روزمره تا ست‌های کامل و چشمگیر، مجموعه‌ای متنوع برای سلیقه‌ها و مناسبت‌های مختلف.',
} as const;

export const LENS_EDITORIAL_HOTSPOTS = [
  {
    id: 'hotspot-ring',
    top: '142px',
    left: '109px',
    topMobile: '29.3%',
    leftMobile: '41.7%',
    chipTop: '36px',
    chipLeft: '-33px',
    chipTopMobile: '0%',
    chipLeftMobile: '10px',
    chipTranslateX: '-50%',
    chipTranslateY: 'calc(-100% - 6px)',
  },
  {
    id: 'hotspot-earring',
    top: '57px',
    left: '174px',
    topMobile: '78.9%',
    leftMobile: '44.6%',
    chipTop: '113px',
    chipLeft: '520px',
    chipTopMobile: '0%',
    chipLeftMobile: '10px',
    chipTranslateX: '-50%',
    chipTranslateY: 'calc(-100% - 6px)',
  },
  {
    id: 'hotspot-bracelet',
    top: '128px',
    left: '293px',
    topMobile: '27.1%',
    leftMobile: '70%',
    chipTop: '241px',
    chipLeft: '59px',
    chipTopMobile: '0%',
    chipLeftMobile: '10px',
    chipTranslateX: '-50%',
    chipTranslateY: 'calc(-100% - 6px)',
  },
] as const;

export const LENS_SHOWCASE_DEMO_ITEMS: LensShowcaseDemoItem[] = [
  {
    id: 'demo-lens-1',
    title: 'کالکشن گوشواره',
    videoUrl: LENS_DEMO_VIDEO_URL,
    thumbnailUrl: LENS_EDITORIAL_HERO,
    heroImageUrl: LENS_EDITORIAL_HERO,
    hotspots: [...LENS_EDITORIAL_HOTSPOTS],
    sortOrder: 0,
    products: DEMO_LENS_PRODUCTS,
  },
  {
    id: 'demo-lens-2',
    title: 'ست عروسی',
    videoUrl: LENS_DEMO_VIDEO_URL,
    thumbnailUrl: '/images/home/new-arrival-lifestyle.png',
    heroImageUrl: '/images/home/new-arrival-lifestyle.png',
    sortOrder: 1,
    products: DEMO_LENS_PRODUCTS,
  },
  {
    id: 'demo-lens-3',
    title: 'طلای روز',
    videoUrl: LENS_DEMO_VIDEO_URL,
    thumbnailUrl: DEMO_LENS_POSTER,
    heroImageUrl: DEMO_LENS_POSTER,
    sortOrder: 2,
    products: DEMO_LENS_PRODUCTS,
  },
];

/** Horizontal lens row — full-width grid until CMS lens API is wired */
export const LENS_CAROUSEL_DEMO_ITEMS: LensShowcaseDemoItem[] = [
  ...LENS_SHOWCASE_DEMO_ITEMS,
  {
    id: 'demo-lens-carousel-4',
    title: 'کالکشن دستبند',
    videoUrl: LENS_DEMO_VIDEO_URL,
    thumbnailUrl: DEMO_LENS_POSTER,
    sortOrder: 3,
    products: DEMO_LENS_PRODUCTS,
  },
];
