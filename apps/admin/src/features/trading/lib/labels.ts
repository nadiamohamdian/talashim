import { formatTomanAmountWithUnit } from '@sadafgold/shared';

export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const TRADE_SIDE_FA: Record<string, string> = {
  BUY: 'خرید',
  SELL: 'فروش',
};

export const TRADE_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  FILLED: 'تکمیل‌شده',
  FAILED: 'ناموفق',
};

export function formatToman(value: string | number) {
  const formatted = formatTomanAmountWithUnit(value);
  return formatted === '—' ? String(value) : formatted;
}

export function formatGram(value: string | number) {
  return `${Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 4 })} گرم`;
}
