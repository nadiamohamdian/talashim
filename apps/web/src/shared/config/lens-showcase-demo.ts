/** Demo lens videos + linked product variants — until CMS lens API is wired */
export interface LensShowcaseProductVariant {
  id: string;
  title: string;
  priceToman: number;
  weightGram: number;
  imageUrl: string;
  href: string;
}

export interface LensShowcaseDemoItem {
  id: string;
  title: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
  products: LensShowcaseProductVariant[];
}

const DEMO_LENS_PRODUCTS: LensShowcaseProductVariant[] = [
  {
    id: 'lens-product-1',
    title: 'انگشتر زنانه لوکس بیضی',
    priceToman: 8_500_000,
    weightGram: 2.8,
    imageUrl: '/images/home/lens-product-ring.png',
    href: '/products',
  },
  {
    id: 'lens-product-2',
    title: 'گوشواره طلای ۱۸ عیار',
    priceToman: 12_400_000,
    weightGram: 3.2,
    imageUrl: '/images/categories/earrings.png',
    href: '/products?category=earrings',
  },
  {
    id: 'lens-product-3',
    title: 'دستبند زنجیری ظریف',
    priceToman: 9_750_000,
    weightGram: 4.1,
    imageUrl: '/images/categories/bracelets.png',
    href: '/products?category=bracelets',
  },
];

const DEMO_LENS_POSTER = '/images/home/lens-demo-poster.png';
export const LENS_EDITORIAL_HERO =
  '/images/home/9c4dd67d8f1d19b4e88be95aa15037b4%202.png';

export const LENS_EDITORIAL_META = {
  eyebrow: 'Talashim Lens',
  title: 'ست‌ها از نمای نزدیک',
  description:
    'از نیم‌ست‌های ظریف روزمره تا ست‌های کامل و چشمگیر، مجموعه‌ای متنوع برای سلیقه‌ها و مناسبت‌های مختلف.',
} as const;

export const LENS_EDITORIAL_HOTSPOTS = [
  { id: 'hotspot-ring', top: '52%', left: '36%' },
  { id: 'hotspot-earring', top: '20%', left: '58%' },
  { id: 'hotspot-bracelet', top: '72%', left: '40%' },
] as const;

export const LENS_SHOWCASE_DEMO_ITEMS: LensShowcaseDemoItem[] = [
  {
    id: 'demo-lens-1',
    title: 'کالکشن گوشواره',
    videoUrl: '',
    thumbnailUrl: LENS_EDITORIAL_HERO,
    sortOrder: 0,
    products: DEMO_LENS_PRODUCTS,
  },
  {
    id: 'demo-lens-2',
    title: 'ست عروسی',
    videoUrl: '',
    thumbnailUrl: '/images/home/new-arrival-lifestyle.png',
    sortOrder: 1,
    products: DEMO_LENS_PRODUCTS,
  },
  {
    id: 'demo-lens-3',
    title: 'طلای روز',
    videoUrl: '',
    thumbnailUrl: DEMO_LENS_POSTER,
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
    videoUrl: '',
    thumbnailUrl: DEMO_LENS_POSTER,
    sortOrder: 3,
    products: DEMO_LENS_PRODUCTS,
  },
];
