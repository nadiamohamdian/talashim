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
    imageUrl: '/images/home/new-arrival-necklace.png',
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

export const LENS_SHOWCASE_DEMO_ITEMS: LensShowcaseDemoItem[] = [
  {
    id: 'demo-lens-1',
    title: 'کالکشن گوشواره',
    videoUrl: '',
    thumbnailUrl: DEMO_LENS_POSTER,
    sortOrder: 0,
    products: DEMO_LENS_PRODUCTS,
  },
  {
    id: 'demo-lens-2',
    title: 'ست عروسی',
    videoUrl: '',
    thumbnailUrl: DEMO_LENS_POSTER,
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
