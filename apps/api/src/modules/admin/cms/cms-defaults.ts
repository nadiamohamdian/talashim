import type { CmsHeroConfig, CmsHomepageSections } from '@talashim/types';
import { getApiEnv } from '@/config/env';

export const CMS_HERO_MEDIA_FILE = 'a5b565d2-4979-4a17-9538-66f5d01d5397.png';
export const CMS_HERO_MEDIA_FOLDER = 'general';

export function buildCmsHeroMediaUrl(): string {
  const env = getApiEnv();
  const publicBase = env.UPLOAD_PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${publicBase}/${env.API_PREFIX}/v${env.API_VERSION}/media-files/${CMS_HERO_MEDIA_FOLDER}/${CMS_HERO_MEDIA_FILE}`;
}

export const DEFAULT_CMS_HERO: CmsHeroConfig = {
  badge: 'کالکشن جدید',
  title: 'زیبایی ماندگار',
  titleAccent: 'در هر قطعه طلا',
  description:
    'گالری طلای طلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین امن.',
  primaryCta: { label: 'مشاهده کالکشن ها', href: '/products' },
  secondaryCta: { label: 'انگشترهای زنانه', href: '/products?category=rings' },
  imageUrl: buildCmsHeroMediaUrl(),
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
 