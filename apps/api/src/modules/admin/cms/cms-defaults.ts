import type {
  CmsCategoryListingGalleryItem,
  CmsCategoryShowcaseItem,
  CmsHeroConfig,
  CmsHomepageSections,
} from '@talashim/types';
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
  desktopBackgroundImageUrl: '',
  desktopCarouselItems: [
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
  ],
};

export const DEFAULT_CMS_CATEGORY_SHOWCASE_ITEMS: CmsCategoryShowcaseItem[] = [
  { slug: 'rings', label: 'انگشتر', href: '/products?category=rings' },
  { slug: 'bracelets', label: 'دستبند', href: '/products?category=bracelets' },
  { slug: 'earrings', label: 'گوشواره', href: '/products?category=earrings' },
  { slug: 'necklaces', label: 'گردنبند', href: '/products?category=necklaces' },
];

export const CMS_CATEGORY_SHOWCASE_SLUGS = DEFAULT_CMS_CATEGORY_SHOWCASE_ITEMS.map(
  (item) => item.slug,
);

export const DEFAULT_CMS_CATEGORY_LISTING_GALLERY_ITEMS: CmsCategoryListingGalleryItem[] = [
  { slug: 'rings', label: 'انگشتر زنانه', imageUrls: [] },
  { slug: 'necklaces', label: 'گردنبند', imageUrls: [] },
  { slug: 'bracelets', label: 'دستبند', imageUrls: [] },
  { slug: 'earrings', label: 'گوشواره', imageUrls: [] },
  { slug: 'sets', label: 'ست و نیم‌ست', imageUrls: [] },
  { slug: 'wedding-rings', label: 'حلقه ازدواج', imageUrls: [] },
  { slug: 'coins', label: 'سکه', imageUrls: [] },
];

export const DEFAULT_CMS_SECTIONS: CmsHomepageSections = {
  featuredTitle: 'جدیدترین محصولات',
  featuredSubtitle: 'آخرین طراحی‌های طلا و جواهر',
  bestsellerTitle: 'پرفروش‌ترین محصولات',
  bestsellerSubtitle: 'بر اساس تعداد فروش واقعی',
  newArrivalsTitle: 'جدیدترین ها',
  showCategoryShowcase: true,
  lensSetsShowcase: {
    eyebrow: 'Talashim Lens',
    title: 'ست‌ها از نمای نزدیک',
    description:
      'از نیم‌ست‌های ظریف روزمره تا ست‌های کامل و چشمگیر، مجموعه‌ای متنوع برای سلیقه‌ها و مناسبت‌های مختلف.',
  },
  categoryShowcase: {
    title: 'دسته بندی محصولات',
    items: DEFAULT_CMS_CATEGORY_SHOWCASE_ITEMS.map((item) => ({ ...item })),
  },
  categoryListingGallery: {
    items: DEFAULT_CMS_CATEGORY_LISTING_GALLERY_ITEMS.map((item) => ({
      ...item,
      imageUrls: [],
    })),
  },
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
 