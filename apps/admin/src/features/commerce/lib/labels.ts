export const STANDARD_PRODUCT_KARATS = [
  { value: '18', label: '۱۸ عیار (750)' },
  { value: '21', label: '۲۱ عیار (875)' },
  { value: '22', label: '۲۲ عیار (916)' },
  { value: '24', label: '۲۴ عیار (999)' },
] as const;

export const STANDARD_PRODUCT_KARAT_VALUES = STANDARD_PRODUCT_KARATS.map((item) => item.value);

export { ORDER_STATUS_FA, PAYMENT_STATUS_FA, PRODUCT_CATEGORY_FA, formatToman } from '@/features/reports/lib/format';

export const selectFieldClass =
  'mt-1.5 flex h-11 w-full min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 text-[0.9375rem] leading-normal text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-muted)] disabled:cursor-not-allowed disabled:opacity-55';

export const INVENTORY_MOVEMENT_FA: Record<string, string> = {
  INITIAL: 'موجودی اولیه',
  ADJUSTMENT: 'تعدیل دستی',
  RESERVATION: 'رزرو',
  RELEASE: 'آزادسازی رزرو',
  ORDER_FULFILLMENT: 'تحویل سفارش',
};
