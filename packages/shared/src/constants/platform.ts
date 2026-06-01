export const platformConfig = {
  name: 'Sadaf Gold',
  adminName: 'Sadaf Gold Admin',
  description: 'Luxury gold trading and e-commerce platform for retail and wholesale experiences.',
  locale: 'fa-IR',
  direction: 'rtl' as const,
  currencyLabel: 'تومان',
} as const;

export const platformModules = [
  'Catalog',
  'Orders',
  'Inventory',
  'Customers',
  'Pricing',
  'Content',
] as const;
