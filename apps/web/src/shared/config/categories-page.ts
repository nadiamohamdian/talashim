import type { CatalogCategory } from '@/lib/api/product.api';

export const CATEGORIES_PAGE_META = {
  eyebrow: 'فروشگاه',
  title: 'دسته‌بندی‌ها',
  description: 'مرور دسته‌های محصول از کاتالوگ زنده.',
} as const;

export const CATEGORIES_PAGE_DEMO: CatalogCategory[] = [
  { slug: 'rings', label: 'انگشتر', productCount: 2 },
  { slug: 'wedding-rings', label: 'حلقه ازدواج', productCount: 2 },
  { slug: 'necklaces', label: 'گردنبند', productCount: 1 },
  { slug: 'bracelets', label: 'دستبند', productCount: 0 },
  { slug: 'earrings', label: 'گوشواره', productCount: 0 },
];
