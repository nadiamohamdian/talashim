export const DEMO_PRODUCT_SKU_PREFIX = 'DEMO-';
export const DEMO_PRODUCT_SLUG_PREFIX = 'demo';

export type CatalogDemoProductCategory =
  | 'ring'
  | 'necklace'
  | 'bracelet'
  | 'earring'
  | 'wedding_ring'
  | 'coin';

export interface CatalogDemoProduct {
  sku: string;
  slug: string;
  title: string;
  category: CatalogDemoProductCategory;
  karat: number;
  weightGram: number;
  makingFeePercent: number;
  priceToman: number;
  inventory: number;
  featured: boolean;
  description: string;
  seoDescription: string;
  storefrontImagePath: string;
  /** Shown in PDP specs for set / half-set products */
  setPartsLabel?: string;
}

const DEMO_STOREFRONT_IMAGES = {
  rings: '/images/categories/rings.png',
  bracelets: '/images/categories/bracelets.png',
  earrings: '/images/categories/earrings.png',
  necklaces: '/images/placeholder-media.svg',
  jewelrySet: '/images/products/jewelry-set-lifestyle.png',
  lifestyle: '/images/home/new-arrival-lifestyle.png',
} as const;

export const CATALOG_DEMO_PRODUCTS: CatalogDemoProduct[] = [
  {
    sku: 'DEMO-1',
    slug: 'demo',
    title: 'انگشتر زنانه لوکس بیضی',
    category: 'ring',
    karat: 18,
    weightGram: 2.8,
    makingFeePercent: 24,
    priceToman: 95_000_000,
    inventory: 3,
    featured: true,
    description:
      'انگشتر زنانه لوکس بیضی با طراحی مینیمال و درخشش بالا، مناسب استفاده روزمره و مهمانی‌های رسمی.',
    seoDescription: 'انگشتر زنانه لوکس بیضی — طلای ۱۸ عیار',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.lifestyle,
  },
  {
    sku: 'DEMO-2',
    slug: 'demo-classic-ring',
    title: 'انگشتر کلاسیک طلا',
    category: 'ring',
    karat: 18,
    weightGram: 3.1,
    makingFeePercent: 24,
    priceToman: 98_000_000,
    inventory: 3,
    featured: false,
    description: 'انگشتر کلاسیک طلای ۱۸ عیار با طراحی ماندگار.',
    seoDescription: 'انگشتر کلاسیک طلا ۱۸ عیار',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.rings,
  },
  {
    sku: 'DEMO-3',
    slug: 'demo-bracelet',
    title: 'دستبند طلای ۱۸ عیار',
    category: 'bracelet',
    karat: 18,
    weightGram: 4.5,
    makingFeePercent: 22,
    priceToman: 112_000_000,
    inventory: 3,
    featured: false,
    description: 'دستبند طلای ۱۸ عیار با بسته‌بندی لوکس.',
    seoDescription: 'دستبند طلای ۱۸ عیار',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.bracelets,
  },
  {
    sku: 'DEMO-4',
    slug: 'demo-earring',
    title: 'گوشواره آذین مدل نجو',
    category: 'earring',
    karat: 18,
    weightGram: 2.4,
    makingFeePercent: 20,
    priceToman: 125_000_000,
    inventory: 3,
    featured: false,
    description: 'گوشواره ظریف با نگین‌های درخشان.',
    seoDescription: 'گوشواره آذین مدل نجو',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.earrings,
  },
  {
    sku: 'DEMO-5',
    slug: 'demo-necklace',
    title: 'گردنبند مینیمال',
    category: 'necklace',
    karat: 18,
    weightGram: 4.2,
    makingFeePercent: 21,
    priceToman: 138_000_000,
    inventory: 3,
    featured: false,
    description: 'گردنبند مینیمال طلای ۱۸ عیار.',
    seoDescription: 'گردنبند مینیمال ۱۸ عیار',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.necklaces,
  },
  {
    sku: 'DEMO-6',
    slug: 'demo-wedding-ring-classic',
    title: 'حلقه ازدواج کلاسیک',
    category: 'wedding_ring',
    karat: 18,
    weightGram: 3.2,
    makingFeePercent: 18,
    priceToman: 165_000_000,
    inventory: 3,
    featured: false,
    description: 'حلقه ازدواج کلاسیک ۱۸ عیار.',
    seoDescription: 'حلقه ازدواج کلاسیک',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.rings,
  },
  {
    sku: 'DEMO-7',
    slug: 'demo-wedding-ring-eternity',
    title: 'حلقه ازدواج eternity',
    category: 'wedding_ring',
    karat: 18,
    weightGram: 2.9,
    makingFeePercent: 19,
    priceToman: 95_000_000,
    inventory: 3,
    featured: false,
    description: 'حلقه ازدواج eternity با نگین‌های ظریف.',
    seoDescription: 'حلقه ازدواج eternity',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.rings,
  },
  {
    sku: 'DEMO-8',
    slug: 'demo-engagement-ring',
    title: 'انگشتر نامزدی',
    category: 'ring',
    karat: 18,
    weightGram: 2.6,
    makingFeePercent: 23,
    priceToman: 98_000_000,
    inventory: 3,
    featured: false,
    description: 'انگشتر نامزدی با طراحی لوکس.',
    seoDescription: 'انگشتر نامزدی ۱۸ عیار',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.rings,
  },
  {
    sku: 'DEMO-SET-LIQ',
    slug: 'demo-jewelry-set',
    title: 'ست زیورآلات طلای مایع',
    category: 'bracelet',
    karat: 18,
    weightGram: 12.4,
    makingFeePercent: 22,
    priceToman: 248_500_000,
    inventory: 5,
    featured: true,
    description:
      'ست زیورآلات طلای مایع با طراحی ارگانیک؛ شامل انگشتر، دستبند و گوشواره با پرداخت براق.',
    seoDescription: 'ست زیورآلات طلای مایع ۱۸ عیار — انگشتر، دستبند و گوشواره',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.jewelrySet,
    setPartsLabel: 'انگشتر، دستبند، گوشواره',
  },
  {
    sku: 'DEMO-SET-CLASSIC',
    slug: 'demo-set-classic',
    title: 'ست کلاسیک طلا ۱۸ عیار',
    category: 'necklace',
    karat: 18,
    weightGram: 15.8,
    makingFeePercent: 21,
    priceToman: 285_000_000,
    inventory: 4,
    featured: true,
    description:
      'ست کلاسیک طلای ۱۸ عیار؛ شامل انگشتر، گردنبند و دستبند با طراحی هماهنگ و پرداخت براق.',
    seoDescription: 'ست کلاسیک طلا — انگشتر، گردنبند و دستبند',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.jewelrySet,
    setPartsLabel: 'انگشتر، گردنبند، دستبند',
  },
  {
    sku: 'DEMO-HALF-ELEGANT',
    slug: 'demo-half-set-elegant',
    title: 'نیم ست ظریف طلا',
    category: 'ring',
    karat: 18,
    weightGram: 8.6,
    makingFeePercent: 20,
    priceToman: 198_000_000,
    inventory: 6,
    featured: false,
    description: 'نیم ست ظریف طلا؛ شامل انگشتر و دستبند با فرم مینیمال و سبک.',
    seoDescription: 'نیم ست ظریف — انگشتر و دستبند',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.bracelets,
    setPartsLabel: 'انگشتر، دستبند',
  },
  {
    sku: 'DEMO-SET-WEDDING',
    slug: 'demo-set-wedding-luxury',
    title: 'ست عروسی لوکس',
    category: 'wedding_ring',
    karat: 18,
    weightGram: 14.2,
    makingFeePercent: 19,
    priceToman: 320_000_000,
    inventory: 3,
    featured: true,
    description:
      'ست عروسی لوکس؛ شامل حلقه ازدواج و گردنبند با طراحی هماهنگ برای مراسم عروسی.',
    seoDescription: 'ست عروسی لوکس — حلقه ازدواج و گردنبند',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.rings,
    setPartsLabel: 'حلقه ازدواج، گردنبند',
  },
  {
    sku: 'DEMO-HALF-MINIMAL',
    slug: 'demo-half-set-minimal',
    title: 'نیم ست مینیمال مروارید',
    category: 'necklace',
    karat: 18,
    weightGram: 7.4,
    makingFeePercent: 22,
    priceToman: 175_000_000,
    inventory: 5,
    featured: false,
    description: 'نیم ست مینیمال مروارید؛ شامل گردنبند و انگشتر با الهام از طرح‌های مدرن.',
    seoDescription: 'نیم ست مینیمال — گردنبند و انگشتر',
    storefrontImagePath: DEMO_STOREFRONT_IMAGES.necklaces,
    setPartsLabel: 'گردنبند، انگشتر',
  },
];

export function isCatalogDemoProduct(product: { sku: string; slug: string }): boolean {
  const sku = product.sku.trim().toUpperCase();
  const slug = product.slug.trim().toLowerCase();
  return sku.startsWith(DEMO_PRODUCT_SKU_PREFIX) || slug.startsWith(DEMO_PRODUCT_SLUG_PREFIX);
}

export function findCatalogDemoProduct(slug: string): CatalogDemoProduct | undefined {
  return CATALOG_DEMO_PRODUCTS.find((product) => product.slug === slug);
}

export function mapCatalogDemoCategoryToPrisma(
  category: CatalogDemoProductCategory,
): 'RING' | 'NECKLACE' | 'BRACELET' | 'EARRING' | 'COIN' | 'WEDDING_RING' {
  const map: Record<CatalogDemoProductCategory, 'RING' | 'NECKLACE' | 'BRACELET' | 'EARRING' | 'COIN' | 'WEDDING_RING'> = {
    ring: 'RING',
    necklace: 'NECKLACE',
    bracelet: 'BRACELET',
    earring: 'EARRING',
    coin: 'COIN',
    wedding_ring: 'WEDDING_RING',
  };
  return map[category];
}
