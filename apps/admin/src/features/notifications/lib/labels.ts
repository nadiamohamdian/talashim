export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const NOTIFICATION_CHANNEL_FA: Record<string, string> = {
  IN_APP: 'درون‌برنامه',
  SMS: 'پیامک',
  EMAIL: 'ایمیل',
  PUSH: 'پوش',
};

export const NOTIFICATION_PRIORITY_FA: Record<string, string> = {
  LOW: 'کم',
  NORMAL: 'عادی',
  HIGH: 'بالا',
};

export const DELIVERY_STATUS_FA: Record<string, string> = {
  PENDING: 'در صف',
  SENT: 'ارسال‌شده',
  FAILED: 'ناموفق',
  DELIVERED: 'تحویل‌شده',
};

export const RULE_TRIGGER_FA: Record<string, string> = {
  ORDER_CREATED: 'ثبت سفارش',
  ORDER_PAID: 'پرداخت سفارش',
  KYC_SUBMITTED: 'ارسال KYC',
  KYC_APPROVED: 'تأیید KYC',
  TRADE_FILLED: 'معامله تکمیل',
  LOW_STOCK: 'کم‌موجودی',
  MANUAL: 'دستی',
};

export const STAFF_ROLE_FA: Record<string, string> = {
  SUPER_ADMIN: 'سوپر ادمین',
  SUPPORT: 'پشتیبان',
  ACCOUNTANT: 'حسابدار',
  EDITOR: 'ادیتور',
  WAREHOUSE: 'انباردار',
};
