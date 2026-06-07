import type { CmsHeroConfig, CmsHomepageSections } from '@talashim/types';

export const DEFAULT_CMS_HERO: CmsHeroConfig = {
  badge: 'کالکشن جدید',
  title: 'زیبایی ماندگار',
  titleAccent: 'در هر قطعه طلا',
  description:
    'گالری طلای طلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین امن.',
  primaryCta: { label: 'مشاهده فروشگاه', href: '/products' },
  secondaryCta: { label: 'انگشترهای زنانه', href: '/categories/rings' },
  imageUrl: '',
};

export const DEFAULT_CMS_SECTIONS: CmsHomepageSections = {
  featuredTitle: 'جدیدترین محصولات',
  featuredSubtitle: 'آخرین طراحی‌های طلا و جواهر',
  bestsellerTitle: 'پرفروش‌ترین محصولات',
  bestsellerSubtitle: 'بر اساس تعداد فروش واقعی',
  showCategoryShowcase: true,
};

export const DEFAULT_CMS_SEO = {
  siteTitle: 'طلای طلاشیم | فروشگاه آنلاین طلا و جواهر',
  siteDescription:
    'خرید آنلاین طلا و جواهر با قیمت روز، وزن دقیق، اجرت شفاف و ارسال امن در سراسر ایران.',
  defaultOgImageUrl: null,
  robotsIndex: true,
  googleAnalyticsId: null as string | null,
  extraMeta: null as Record<string, string> | null,
};
