export const STANDARD_PRODUCT_KARATS = [
  { value: '18', label: '۱۸ عیار (750)' },
  { value: '21', label: '۲۱ عیار (875)' },
  { value: '22', label: '۲۲ عیار (916)' },
  { value: '24', label: '۲۴ عیار (999)' },
] as const;

export const STANDARD_PRODUCT_KARAT_VALUES = STANDARD_PRODUCT_KARATS.map((item) => item.value);

export { ORDER_STATUS_FA, PAYMENT_STATUS_FA, PRODUCT_CATEGORY_FA, formatToman } from '@/features/reports/lib/format';

export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const INVENTORY_MOVEMENT_FA: Record<string, string> = {
  INITIAL: 'موجودی اولیه',
  ADJUSTMENT: 'تعدیل دستی',
  RESERVATION: 'رزرو',
  RELEASE: 'آزادسازی رزرو',
  ORDER_FULFILLMENT: 'تحویل سفارش',
};
