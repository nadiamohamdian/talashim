import type { CmsHeroConfig, CmsHomepageSections } from '@talashim/types';

export const DEFAULT_CMS_HERO: CmsHeroConfig = {
  badge: 'کالکشن جدید',
  title: 'زیبایی ماندگار',
  titleAccent: 'در هر قطعه طلا',
  description:
    'گالری طلای تلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین امن.',
  primaryCta: { label: 'مشاهده فروشگاه', href: '/products' },
  secondaryCta: { label: 'انگشترهای زنانه', href: '/categories/rings' },
  imageUrl:
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
};

export const DEFAULT_CMS_SECTIONS: CmsHomepageSections = {
  featuredTitle: 'جدیدترین محصولات',
  featuredSubtitle: 'آخرین طراحی‌های طلا و جواهر',
  bestsellerTitle: 'پرفروش‌ترین محصولات',
  bestsellerSubtitle: 'بر اساس تعداد فروش واقعی',
  showCategoryShowcase: true,
};

export const DEFAULT_CMS_SEO = {
  siteTitle: 'طلای تلاشیم | فروشگاه آنلاین طلا و جواهر',
  siteDescription:
    'خرید آنلاین طلا و جواهر با قیمت روز، وزن دقیق، اجرت شفاف و ارسال امن در سراسر ایران.',
  defaultOgImageUrl:
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
  robotsIndex: true,
  googleAnalyticsId: null as string | null,
  extraMeta: null as Record<string, string> | null,
};
