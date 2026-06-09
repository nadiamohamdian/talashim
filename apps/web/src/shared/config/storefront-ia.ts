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

/** Figma node 1752:5944 — homepage category showcase (3 columns) */
export const HOME_CATEGORY_SHOWCASE = [
  {
    slug: 'rings',
    label: 'انگشتر',
    href: '/products?category=rings',
    imageFile: 'd428dd8d-6f43-4a64-bda1-47457426c536.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.rings,
  },
  {
    slug: 'bracelets',
    label: 'دستبند',
    href: '/products?category=bracelets',
    imageFile: '8dc1f429-afdc-48c7-81a4-f8a5e972faf4.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.bracelets,
  },
  {
    slug: 'earrings',
    label: 'گوشواره',
    href: '/products?category=earrings',
    imageFile: '4df3c2ed-250d-4700-aca7-d7b54e5422b8.png',
    fallbackImageUrl: CATEGORY_FALLBACK_IMAGES.earrings,
  },
] as const;

/** Figma node 1752:5924 — homepage budget picker (mobile) */
export const HOME_BUDGET_RANGES = [
  {
    id: '90-110m',
    label: '۹۰-۱۱۰ میلیون تومان',
    href: '/products?minPrice=90000000&maxPrice=110000000',
  },
  {
    id: '110-130m',
    label: '۱۱۰-۱۳۰ میلیون تومان',
    href: '/products?minPrice=110000000&maxPrice=130000000',
  },
  {
    id: '130-150m',
    label: '۱۳۰-۱۵۰ میلیون تومان',
    href: '/products?minPrice=130000000&maxPrice=150000000',
  },
  {
    id: '150m-plus',
    label: '+۱۵۰ میلیون تومان',
    href: '/products?minPrice=150000000',
  },
] as const;

/** Homepage wedding rings promo — Figma node 1752:5959 */
export const HOME_WEDDING_PROMO = {
  title: 'برای یک عمر کنار هم',
  subtitle: 'حلقه‌های ازدواج و ست، برای لحظه‌های ماندگار',
  ctaLabel: 'مشاهده محصولات',
  href: '/products?category=ring',
  backgroundImageUrl: '/images/home/wedding-promo-bg.png',
  ringImageUrl: '/images/home/wedding-ring.png',
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

const DEMO_CAROUSEL_PRODUCT: Omit<HomeProductCarouselItem, 'id'> = {
  title: 'انگشتر زنانه لوکس بیضی',
  priceToman: 8_500_000,
  weightGram: 2.8,
  imageUrl: '/images/home/new-arrival-necklace.png',
  hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
  href: '/products',
};

export const HOME_NEW_ARRIVALS_SHOWCASE: HomeProductCarouselItem[] = [
  { id: 'demo-new-arrival-1', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-new-arrival-2', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-new-arrival-3', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-new-arrival-4', ...DEMO_CAROUSEL_PRODUCT },
];

export const HOME_BESTSELLERS_SHOWCASE: HomeProductCarouselItem[] = [
  { id: 'demo-bestseller-1', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-bestseller-2', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-bestseller-3', ...DEMO_CAROUSEL_PRODUCT },
  { id: 'demo-bestseller-4', ...DEMO_CAROUSEL_PRODUCT },
];

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
