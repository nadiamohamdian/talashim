export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const WALLET_TX_TYPE_FA: Record<string, string> = {
  DEPOSIT: 'واریز',
  WITHDRAWAL: 'برداشت',
  TRANSFER: 'انتقال',
  CONVERSION: 'تبدیل',
  TRADE_BUY: 'خرید طلا',
  TRADE_SELL: 'فروش طلا',
  ADJUSTMENT: 'تعدیل',
  FEE: 'کارمزد',
};

export const WALLET_TX_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  POSTED: 'ثبت‌شده',
  FAILED: 'ناموفق',
  REVERSED: 'برگشت',
};

export const LEDGER_CATEGORY_FA: Record<string, string> = {
  ASSET: 'دارایی',
  LIABILITY: 'بدهی',
  EQUITY: 'حقوق صاحبان سهام',
  REVENUE: 'درآمد',
  EXPENSE: 'هزینه',
};

export const LEDGER_SIDE_FA: Record<string, string> = {
  DEBIT: 'بدهکار',
  CREDIT: 'بستانکار',
};

import {
  formatTomanAmount,
  formatTomanAmountWithUnit,
  TOMAN_UNIT_FA,
} from '@sadafgold/shared';

export const CURRENCY_UNIT_FA = TOMAN_UNIT_FA;

export function formatToman(value: string | number): string {
  const formatted = formatTomanAmount(value);
  if (formatted === '—') {
    return String(value);
  }
  return formatted;
}

export function formatTomanWithUnit(value: string | number): string {
  const formatted = formatTomanAmountWithUnit(value);
  return formatted === '—' ? String(value) : formatted;
}

export function formatAssetAmount(
  amount: string | number,
  assetType: 'GOLD' | 'RIAL' | string,
): string {
  return assetType === 'GOLD'
    ? `${amount} گرم`
    : `${formatTomanWithUnit(amount)}`;
}
