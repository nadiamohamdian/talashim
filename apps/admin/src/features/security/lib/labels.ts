import type { AdminSessionStatus } from '@sadafgold/types';

export const AUTH_ACTION_LABELS: Record<string, string> = {
  'auth.register': 'ثبت‌نام',
  'auth.login': 'ورود با رمز',
  'auth.logout': 'خروج',
  'auth.refresh': 'تمدید نشست',
  'auth.otp_requested': 'درخواست OTP',
  'auth.otp_verified': 'تأیید OTP',
};

export function getAuthActionLabel(action: string): string {
  return AUTH_ACTION_LABELS[action] ?? action;
}

export const SESSION_STATUS_LABELS: Record<AdminSessionStatus, string> = {
  active: 'فعال',
  revoked: 'لغو شده',
  expired: 'منقضی',
};

export const SESSION_STATUS_CLASS: Record<AdminSessionStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  revoked: 'bg-stone-100 text-stone-600 border-stone-200',
  expired: 'bg-amber-50 text-amber-900 border-amber-200',
};

export const SOURCE_LABELS: Record<string, string> = {
  platform: 'پلتفرم',
  wallet: 'کیف پول',
  trade: 'معاملات',
};

export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm text-stone-900';
