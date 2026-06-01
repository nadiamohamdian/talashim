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

export function formatToman(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) {
    return String(value);
  }
  return n.toLocaleString('fa-IR');
}
