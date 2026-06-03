export const selectFieldClass =
  'flex h-11 min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm text-stone-900';

export const KYC_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
};

export const USER_ROLE_OPTIONS = [
  { value: '', label: 'همه نقش‌ها' },
  { value: 'CUSTOMER', label: 'مشتری' },
  { value: 'SUPER_ADMIN', label: 'سوپر ادمین' },
  { value: 'SUPPORT', label: 'پشتیبان' },
  { value: 'ACCOUNTANT', label: 'حسابدار' },
  { value: 'EDITOR', label: 'ادیتور' },
  { value: 'WAREHOUSE', label: 'انباردار' },
] as const;

export const KYC_STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'APPROVED', label: 'تأیید شده' },
  { value: 'REJECTED', label: 'رد شده' },
] as const;
