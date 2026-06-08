import { formatTomanAmountWithUnit } from '@sadafgold/shared';

export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const PRICE_SOURCE_FA: Record<string, string> = {
  PRIMARY: 'اصلی',
  FALLBACK: 'پشتیبان',
  MANUAL: 'دستی',
};

export const PROVIDER_STATUS_CLASS: Record<string, string> = {
  healthy: 'bg-emerald-50 text-emerald-800',
  degraded: 'bg-amber-50 text-amber-800',
  down: 'bg-rose-50 text-rose-800',
  unknown: 'bg-stone-100 text-stone-600',
};

/** Monetary amounts across the platform are displayed in Toman. */
export function formatRial(value: string | number): string {
  const formatted = formatTomanAmountWithUnit(value);
  return formatted === '—' ? String(value) : formatted;
}
