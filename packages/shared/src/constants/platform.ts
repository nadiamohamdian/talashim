export const platformConfig = {
  name: 'طلاشیم',
  nameEn: 'Talashim',
  storeName: 'گالری طلای طلاشیم',
  adminName: 'پنل مدیریت طلاشیم',
  description: 'Luxury gold trading and e-commerce platform for retail and wholesale experiences.',
  locale: 'fa-IR',
  direction: 'rtl' as const,
  currencyLabel: 'تومان',
} as const;

/** Browser tab / SEO title suffix, e.g. «سوالات متداول | Talashim». */
export function pageTitle(segment: string): string {
  return `${segment} | ${platformConfig.nameEn}`;
}

export const platformModules = [
  'Catalog',
  'Orders',
  'Inventory',
  'Customers',
  'Pricing',
  'Content',
] as const;
