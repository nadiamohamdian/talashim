import type { ProductCategorySlug, ProductType } from '@sadafgold/types';
import { pageTitle } from '@sadafgold/shared';
import { CATEGORY_FALLBACK_IMAGES } from '@/shared/config/images';

export interface StorefrontNavItem {
  label: string;
  href: string;
  description?: string;
}

export interface StorefrontCategory {
  slug: ProductCategorySlug;
  label: string;
  labelFa: string;
  productTypes: ProductType[];
  seoTitle: string;
  seoDescription: string;
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, { label: string; labelFa: string }> = {
  melted_gold: { label: 'Melted Gold', labelFa: 'طلای آب‌شده' },
  gold_jewelry: { label: 'Gold Jewelry', labelFa: 'زیورآلات طلا' },
  coins: { label: 'Coins', labelFa: 'سکه' },
  investment_gold: { label: 'Investment Gold', labelFa: 'طلای سرمایه‌گذاری' },
  wholesale: { label: 'Wholesale', labelFa: 'عمده‌فروشی' },
};

export const STOREFRONT_CATEGORIES: StorefrontCategory[] = [
  {
    slug: 'rings',
    label: 'Rings',
    labelFa: 'انگشتر',
    productTypes: ['gold_jewelry'],
    seoTitle: pageTitle('انگشتر طلا'),
    seoDescription: 'انگشترهای طلای ۱۸ و ۲۱ عیار با اجرت شفاف و قیمت روز.',
  },
  {
    slug: 'necklaces',
    label: 'Necklaces',
    labelFa: 'گردنبند',
    productTypes: ['gold_jewelry'],
    seoTitle: pageTitle('گردنبند طلا'),
    seoDescription: 'گردنبندهای لوکس با طراحی مینیمال و قیمت‌گذاری لحظه‌ای.',
  },
  {
    slug: 'bracelets',
    label: 'Bracelets',
    labelFa: 'دستبند',
    productTypes: ['gold_jewelry'],
    seoTitle: pageTitle('دستبند طلا'),
    seoDescription: 'دستبند طلا با وزن دقیق و ضمانت اصالت.',
  },
  {
    slug: 'earrings',
    label: 'Earrings',
    labelFa: 'گوشواره',
    productTypes: ['gold_jewelry'],
    seoTitle: pageTitle('گوشواره طلا'),
    seoDescription: 'گوشواره‌های طلا برای استایل روزمره و مجلسی.',
  },
  {
    slug: 'wedding-rings',
    label: 'Wedding Rings',
    labelFa: 'حلقه ازدواج',
    productTypes: ['gold_jewelry'],
    seoTitle: pageTitle('حلقه ازدواج'),
    seoDescription: 'حلقه‌های ازدواج و ست‌های طلا برای لحظه‌های ماندگار.',
  },
  {
    slug: 'coins',
    label: 'Coins',
    labelFa: 'سکه',
    productTypes: ['coins', 'investment_gold'],
    seoTitle: pageTitle('سکه طلا'),
    seoDescription: 'سکه‌های سرمایه‌گذاری با قیمت شفاف.',
  },
  {
    slug: 'bars',
    label: 'Bars',
    labelFa: 'شمش',
    productTypes: ['investment_gold'],
    seoTitle: pageTitle('شمش طلا'),
    seoDescription: 'شمش طلای سرمایه‌گذاری با عیار معتبر.',
  },
  {
    slug: 'melted',
    label: 'Melted',
    labelFa: 'آب‌شده',
    productTypes: ['melted_gold'],
    seoTitle: pageTitle('طلای آب‌شده'),
    seoDescription: 'خرید طلای آب‌شده با قیمت لحظه‌ای — معامله در پنل کاربری.',
  },
  {
    slug: 'wholesale',
    label: 'Wholesale',
    labelFa: 'عمده',
    productTypes: ['wholesale'],
    seoTitle: pageTitle('خرید عمده طلا'),
    seoDescription: 'کاتالوگ عمده برای همکاران — ورود سازمانی.',
  },
];

export const PRIMARY_NAV: StorefrontNavItem[] = [
  { label: 'صفحه اصلی', href: '/' },
  { label: 'فروشگاه', href: '/products' },
  { label: 'محصولات', href: '/categories' },
  { label: 'تماس با ما', href: '/contact' },
];

export interface MobileHamburgerSubLink {
  label: string;
  href: string;
}

export interface MobileHamburgerMenuItem {
  id: string;
  label: string;
  href?: string;
  subLinks?: MobileHamburgerSubLink[];
  priceRanges?: MobileHamburgerSubLink[];
}

/** Figma nodes 1755:8299 + 1755:8312 — mobile hamburger drawer */
export const MOBILE_HAMBURGER_MENU: MobileHamburgerMenuItem[] = [
  {
    id: 'rings',
    label: 'انگشتر',
    subLinks: [
      { label: 'انگشتر ظریف', href: '/products?category=rings&ringStyle=delicate' },
      { label: 'انگشتر نگین‌دار', href: '/products?category=rings&ringStyle=gem' },
      { label: 'انگشتر بدون نگین', href: '/products?category=rings&ringStyle=plain' },
      { label: 'انگشتر مینیمال', href: '/products?category=rings&ringStyle=minimal' },
      { label: 'انگشتر پهن', href: '/products?category=rings&ringStyle=wide' },
      { label: 'انگشتر مولتی کالر', href: '/products?category=rings&ringStyle=multi-color' },
      { label: 'انگشتر تحویل فوری', href: '/products?category=rings&ringStyle=express' },
    ],
    priceRanges: [
      { label: 'تا 20 میلیون تومان', href: '/products?category=rings&maxPrice=20000000' },
      { label: '20 تا 40 میلیون تومان', href: '/products?category=rings&minPrice=20000000&maxPrice=40000000' },
      { label: '40 تا 60 میلیون تومان', href: '/products?category=rings&minPrice=40000000&maxPrice=60000000' },
      { label: '60 تا 80 میلیون تومان', href: '/products?category=rings&minPrice=60000000&maxPrice=80000000' },
      { label: 'بالای 80 میلیون تومان', href: '/products?category=rings&minPrice=80000000' },
    ],
  },
  { id: 'bracelets', label: 'دستبند', href: '/categories/bracelets' },
  { id: 'necklaces', label: 'گردنبند', href: '/categories/necklaces' },
  { id: 'earrings', label: 'گوشواره', href: '/categories/earrings' },
  { id: 'collections', label: 'کالکشن ها', href: '/products?sort=new-collection' },
  { id: 'gift', label: 'هدیه', href: '/products?type=gold_jewelry' },
];

/** Figma node 1752:5944 (mobile) + 1919:7554 (desktop) */
export interface HomeCategoryShowcaseItem {
  slug: string;
  label: string;
  href: string;
  imageFile: string;
  fallbackImageUrl: string;
  desktopImageUrl?: string;
}

export const HOME_CATEGORY_SHOWCASE: HomeCategoryShowcaseItem[] = [
  {
    slug: 'rings',
    label: 'انگشتر',
    href: '/products?category=rings',
    imageFile: 'd428dd8d-6f43-4a64-bda1-47457426c536.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.rings,
    desktopImageUrl: '/images/home/category-desktop/rings.jpg',
  },
  {
    slug: 'bracelets',
    label: 'دستبند',
    href: '/products?category=bracelets',
    imageFile: '8dc1f429-afdc-48c7-81a4-f8a5e972faf4.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.bracelets,
    desktopImageUrl: '/images/home/category-desktop/bracelets.jpg',
  },
  {
    slug: 'earrings',
    label: 'گوشواره',
    href: '/products?category=earrings',
    imageFile: '4df3c2ed-250d-4700-aca7-d7b54e5422b8.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.earrings,
  },
  {
    slug: 'necklaces',
    label: 'گردنبند',
    href: '/products?category=necklaces',
    imageFile: '4df3c2ed-250d-4700-aca7-d7b54e5422b8.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.necklaces,
    desktopImageUrl: '/images/home/71204743576e384a1b000507bf12a9ea%201.png',
  },
];

/** Figma node 1875:948 — homepage budget picker (mobile) */
export const HOME_BUDGET_RANGES = [
  {
    id: '1-3m',
    label: '۱-۳ میلیون تومان',
    href: '/products?minPrice=1000000&maxPrice=3000000',
  },
  {
    id: '4-8m',
    label: '۴-۸ میلیون تومان',
    href: '/products?minPrice=4000000&maxPrice=8000000',
  },
  {
    id: '9-15m',
    label: '۹-۱۵ میلیون تومان',
    href: '/products?minPrice=9000000&maxPrice=15000000',
  },
  {
    id: '16m-plus',
    label: 'بالای ۱۶ میلیون تومان',
    href: '/products?minPrice=16000000',
  },
] as const;

/** Gift shop — budget ranges scoped to gold jewelry gifts */
export const GIFT_BUDGET_RANGES = [
  {
    id: 'gift-1-3m',
    label: '۱-۳ میلیون تومان',
    href: '/products?type=gold_jewelry&minPrice=1000000&maxPrice=3000000',
  },
  {
    id: 'gift-4-8m',
    label: '۴-۸ میلیون تومان',
    href: '/products?type=gold_jewelry&minPrice=4000000&maxPrice=8000000',
  },
  {
    id: 'gift-9-15m',
    label: '۹-۱۵ میلیون تومان',
    href: '/products?type=gold_jewelry&minPrice=9000000&maxPrice=15000000',
  },
  {
    id: 'gift-16m-plus',
    label: 'بالای ۱۶ میلیون تومان',
    href: '/products?type=gold_jewelry&minPrice=16000000',
  },
] as const;

export const GIFT_LISTING_PAGE = {
  title: 'هدیه طلا',
  subtitle: 'طلاهای مناسب هدیه — بودجه خود را انتخاب کنید یا همه پیشنهادها را ببینید',
  breadcrumbs: [{ label: 'فروشگاه' }, { label: 'هدیه' }],
} as const;

/** Homepage wedding rings promo — Figma Group 386 (1616×512 artboard) */
export const HOME_WEDDING_PROMO = {
  title: 'برای یک عمر کنار هم',
  subtitle: 'حلقه‌های ازدواج و ست، برای لحظه‌های ماندگار',
  desktopSubtitle:
    'حلقه‌های ست و ازدواج با طراحی‌های هماهنگ و ماندگار، برای آغاز فصل جدیدی از زندگی شما.',
  ctaLabel: 'مشاهده محصولات',
  href: '/products?category=wedding-rings',
  imageUrl: '/images/home/Group 386.png',
} as const;

/** Homepage brand editorial — Figma Group 342 (below bestsellers) */
export const HOME_BRAND_EDITORIAL = {
  title: 'هر قطعه، فراتر از یک اکسسوری',
  description:
    'ما باور داریم اکسسوری‌ها تنها برای درخشیدن ساخته نمی‌شوند؛ آن‌ها همراه لحظه‌هایی هستند که ارزش به‌یادماندن دارند. هر قطعه با دقت در جزئیات، ظرافت در طراحی و توجه به کیفیت خلق می‌شود تا فراتر از یک اکسسوری باشد. از مناسبت‌های خاص گرفته تا زیبایی روزمره، طلاهای ما بخشی از داستانی هستند که با گذر زمان ارزش و معنا پیدا می‌کند و برای سال‌ها همراه شما باقی می‌ماند.',
  leftImageUrl: '/images/home/Capture58%202.png',
  rightImageUrl: '/images/home/Capture58_2-removebg-preview%201.png',
} as const;

/** Homepage product carousel — demo items until admin CMS is wired */
export interface HomeProductCarouselItem {
  id: string;
  title: string;
  priceToman: number;
  weightGram: number;
  imageUrl: string;
  hoverImageUrl?: string;
  href?: string;
}

const DEMO_CAROUSEL_HOVER_LIFESTYLE =
  '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png';

/** Lifestyle image shown on carousel card hover when product has no distinct hover asset */
export const HOME_PRODUCT_CAROUSEL_FALLBACK_HOVER_IMAGE =
  '/images/home/new-arrival-lifestyle.png';

const DEMO_CAROUSEL_PRODUCTS: HomeProductCarouselItem[] = [
  {
    id: 'demo-carousel-ring',
    title: 'انگشتر زنانه لوکس بیضی',
    priceToman: 8_500_000,
    weightGram: 2.8,
    imageUrl: '/images/home/lens-product-ring.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo',
  },
  {
    id: 'demo-carousel-necklace',
    title: 'گردنبند طلای ۱۸ عیار',
    priceToman: 14_200_000,
    weightGram: 3.5,
    imageUrl: '/images/home/new-arrival-necklace.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo-necklace',
  },
  {
    id: 'demo-carousel-earrings',
    title: 'گوشواره طلای ۱۸ عیار',
    priceToman: 12_400_000,
    weightGram: 3.2,
    imageUrl: '/images/home/hero-carousel-necklace.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo-earring',
  },
  {
    id: 'demo-carousel-bracelet',
    title: 'دستبند زنجیری ظریف',
    priceToman: 9_750_000,
    weightGram: 4.1,
    imageUrl: '/images/home/hero-carousel-bracelet.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo-bracelet',
  },
  {
    id: 'demo-carousel-set',
    title: 'نیم‌ست طلای روزمره',
    priceToman: 18_900_000,
    weightGram: 5.6,
    imageUrl: '/images/home/hero-carousel-ring.png',
    hoverImageUrl: DEMO_CAROUSEL_HOVER_LIFESTYLE,
    href: '/products/demo-half-set-minimal',
  },
  {
    id: 'demo-carousel-vintage-bracelet',
    title: 'دستبند Vintage Knot',
    priceToman: 11_300_000,
    weightGram: 3.9,
    imageUrl: '/images/home/VintageKnotAdjustableBracelet1_720x 2.png',
    hoverImageUrl: DEMO_CAROUSEL_HOVER_LIFESTYLE,
    href: '/products/demo-bracelet',
  },
  {
    id: 'demo-carousel-wedding-ring',
    title: 'انگشتر نامزدی کلاسیک',
    priceToman: 16_800_000,
    weightGram: 4.4,
    imageUrl: '/images/home/wedding-ring.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo-engagement-ring',
  },
  {
    id: 'demo-carousel-pendant',
    title: 'آویز طلای مینیمال',
    priceToman: 7_950_000,
    weightGram: 2.4,
    imageUrl: '/images/home/a3eb1243002467eaa8beb1676880561c 2.png',
    hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
    href: '/products/demo-necklace',
  },
];

export const HOME_NEW_ARRIVALS_SHOWCASE: HomeProductCarouselItem[] = DEMO_CAROUSEL_PRODUCTS;

export const HOME_BESTSELLERS_SHOWCASE: HomeProductCarouselItem[] = DEMO_CAROUSEL_PRODUCTS.map(
  (item, index) => ({
    ...item,
    id: `demo-bestseller-${index + 1}`,
  }),
);

export const HOME_CATEGORY_SHORTCUTS = [
  {
    slug: 'rings',
    label: 'انگشتر',
    href: '/categories/rings',
    imageUrl: CATEGORY_FALLBACK_IMAGES.rings,
  },
  {
    slug: 'gifts-men',
    label: 'هدیه برای آقایان',
    href: '/categories/bracelets',
    imageUrl: CATEGORY_FALLBACK_IMAGES.gifts,
  },
  {
    slug: 'earrings',
    label: 'گوشواره',
    href: '/categories/earrings',
    imageUrl: CATEGORY_FALLBACK_IMAGES.earrings,
  },
  {
    slug: 'bracelets',
    label: 'دستبند',
    href: '/categories/bracelets',
    imageUrl: CATEGORY_FALLBACK_IMAGES.bracelets,
  },
  {
    slug: 'necklaces',
    label: 'گردنبند',
    href: '/categories/necklaces',
    imageUrl: CATEGORY_FALLBACK_IMAGES.necklaces,
  },
] as const;

/** Figma node 1919:7602 — desktop homepage hero */
export const HOME_HERO_DESKTOP_BG =
  '/images/home/f79c2b28-7564-4b56-bc2b-db720beb6f63%20(2)%201.png';

export const HOME_HERO_DESKTOP_NAV = [
  { label: 'انگشتر', href: '/products?category=rings' },
  { label: 'دستبند', href: '/products?category=bracelets' },
  { label: 'گوشواره', href: '/products?category=earrings' },
  { label: 'گردنبند', href: '/products?category=necklaces' },
  { label: 'ست و نیم ست', href: '/products?category=sets' },
  { label: 'کودکانه', href: '/products?category=kids' },
  { label: 'هدیه', href: '/products?type=gold_jewelry' },
] as const;

export interface HomeHeroDesktopCarouselItem {
  id: string;
  imageUrl: string;
  href: string;
}

export const HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT = 3;

export const HOME_HERO_DESKTOP_CAROUSEL: HomeHeroDesktopCarouselItem[] = [
  {
    id: 'hero-carousel-ring',
    imageUrl: '/images/home/hero-carousel-ring.png',
    href: '/products?category=rings',
  },
  {
    id: 'hero-carousel-necklace',
    imageUrl: '/images/home/hero-carousel-necklace.png',
    href: '/products?category=necklaces',
  },
  {
    id: 'hero-carousel-bracelet',
    imageUrl: '/images/home/hero-carousel-bracelet.png',
    href: '/products?category=bracelets',
  },
];

export const FOOTER_NAV = {
  shop: [
    { label: 'همه محصولات', href: '/products' },
    { label: 'زیورآلات', href: '/products?type=gold_jewelry' },
    { label: 'سکه و شمش', href: '/products?type=investment_gold' },
    { label: 'طلای آب‌شده', href: '/products?type=melted_gold' },
  ] satisfies StorefrontNavItem[],
  company: [
    { label: 'درباره ما', href: '/about' },
    { label: 'تماس', href: '/contact' },
    { label: 'سوالات متداول', href: '/faq' },
  ] satisfies StorefrontNavItem[],
  legal: [
    { label: 'قوانین', href: '/terms' },
    { label: 'حریم خصوصی', href: '/policies' },
  ] satisfies StorefrontNavItem[],
};

export const HOME_SECTIONS = [
  { id: 'hero', label: 'Hero & trust' },
  { id: 'live-price', label: 'Live gold ticker' },
  { id: 'featured', label: 'Featured products' },
  { id: 'categories', label: 'Shop by category' },
  { id: 'editorial', label: 'Brand story' },
  { id: 'blog', label: 'Magazine preview' },
  { id: 'cta', label: 'Account / trading CTA' },
] as const;
