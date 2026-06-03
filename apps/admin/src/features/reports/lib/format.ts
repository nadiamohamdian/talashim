export function formatToman(value: number | string): string {
  return Number(value).toLocaleString('fa-IR');
}

export function formatGram(value: string | number): string {
  return Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 4 });
}

export const ORDER_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تأیید شده',
  PAID: 'پرداخت شده',
  CANCELLED: 'لغو شده',
};

export const PAYMENT_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار پرداخت',
  AWAITING_RECEIPT: 'در انتظار فیش',
  RECEIPT_SUBMITTED: 'فیش ارسال شده — بررسی ادمین',
  AUTHORIZED: 'تأیید اولیه / اعتباری',
  PAID: 'پرداخت شده',
  FAILED: 'ناموفق',
  REJECTED: 'فیش رد شده',
  pending: 'در انتظار پرداخت',
  awaiting_receipt: 'در انتظار فیش',
  receipt_submitted: 'فیش ارسال شده',
  authorized: 'تأیید اولیه',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  rejected: 'فیش رد شده',
};

export const TRADE_SIDE_FA: Record<string, string> = {
  BUY: 'خرید',
  SELL: 'فروش',
};

export const TRADE_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  FILLED: 'تکمیل',
  FAILED: 'ناموفق',
};

export const PRODUCT_CATEGORY_FA: Record<string, string> = {
  RING: 'انگشتر',
  NECKLACE: 'گردنبند',
  BRACELET: 'دستبند',
  COIN: 'سکه',
};
