import type { ProductCategorySlug, ProductType } from '@sadafgold/types';
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
    seoTitle: 'انگشتر طلا | Sadaf Gold',
    seoDescription: 'انگشترهای طلای ۱۸ و ۲۱ عیار با اجرت شفاف و قیمت روز.',
  },
  {
    slug: 'necklaces',
    label: 'Necklaces',
    labelFa: 'گردنبند',
    productTypes: ['gold_jewelry'],
    seoTitle: 'گردنبند طلا | Sadaf Gold',
    seoDescription: 'گردنبندهای لوکس با طراحی مینیمال و قیمت‌گذاری لحظه‌ای.',
  },
  {
    slug: 'bracelets',
    label: 'Bracelets',
    labelFa: 'دستبند',
    productTypes: ['gold_jewelry'],
    seoTitle: 'دستبند طلا | Sadaf Gold',
    seoDescription: 'دستبند طلا با وزن دقیق و ضمانت اصالت.',
  },
  {
    slug: 'earrings',
    label: 'Earrings',
    labelFa: 'گوشواره',
    productTypes: ['gold_jewelry'],
    seoTitle: 'گوشواره طلا | Sadaf Gold',
    seoDescription: 'گوشواره‌های طلا برای استایل روزمره و مجلسی.',
  },
  {
    slug: 'coins',
    label: 'Coins',
    labelFa: 'سکه',
    productTypes: ['coins', 'investment_gold'],
    seoTitle: 'سکه طلا | Sadaf Gold',
    seoDescription: 'سکه‌های سرمایه‌گذاری با قیمت شفاف.',
  },
  {
    slug: 'bars',
    label: 'Bars',
    labelFa: 'شمش',
    productTypes: ['investment_gold'],
    seoTitle: 'شمش طلا | Sadaf Gold',
    seoDescription: 'شمش طلای سرمایه‌گذاری با عیار معتبر.',
  },
  {
    slug: 'melted',
    label: 'Melted',
    labelFa: 'آب‌شده',
    productTypes: ['melted_gold'],
    seoTitle: 'طلای آب‌شده | Sadaf Gold',
    seoDescription: 'خرید طلای آب‌شده با قیمت لحظه‌ای — معامله در پنل کاربری.',
  },
  {
    slug: 'wholesale',
    label: 'Wholesale',
    labelFa: 'عمده',
    productTypes: ['wholesale'],
    seoTitle: 'خرید عمده طلا | Sadaf Gold',
    seoDescription: 'کاتالوگ عمده برای همکاران — ورود سازمانی.',
  },
];

export const PRIMARY_NAV: StorefrontNavItem[] = [
  { label: 'صفحه اصلی', href: '/' },
  { label: 'فروشگاه', href: '/products' },
  { label: 'محصولات', href: '/categories' },
  { label: 'تماس با ما', href: '/contact' },
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
