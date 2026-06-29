import type { AdminPermissionKey } from './permissions';
import { ADMIN_PERMISSIONS } from './permissions';

export const ADMIN_PERMISSION_GROUP_LABELS: Record<keyof typeof ADMIN_PERMISSIONS, string> = {
  dashboard: 'داشبورد',
  notifications: 'اعلان‌ها',
  products: 'محصولات و صفحات دسته‌بندی',
  inventory: 'موجودی انبار',
  orders: 'سفارش‌ها و کوپن',
  trading: 'طلای آب‌شده',
  pricing: 'قیمت‌گذاری',
  users: 'کاربران',
  kyc: 'احراز هویت',
  finance: 'مالی',
  ledger: 'دفتر کل',
  cms: 'محتوا (صفحه اصلی، بنر، لنز، وبلاگ)',
  media: 'کتابخانه رسانه',
  reports: 'گزارش‌ها',
  security: 'امنیت و دسترسی',
  settings: 'تنظیمات سیستم',
};

export interface AdminPermissionLabel {
  labelFa: string;
  hintFa?: string;
}

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, AdminPermissionLabel> = {
  'admin.dashboard.view': {
    labelFa: 'مشاهده داشبورد',
    hintFa: 'صفحه نمای کلی پنل',
  },
  'admin.notifications.read': {
    labelFa: 'مشاهده اعلان‌ها',
    hintFa: 'صندوق ورودی و لاگ ارسال',
  },
  'admin.notifications.manage': {
    labelFa: 'مدیریت اعلان‌ها',
    hintFa: 'قالب‌ها و قوانین اعلان',
  },
  'admin.products.read': {
    labelFa: 'مشاهده محصولات',
    hintFa: 'فهرست محصولات، نظرات و صفحات دسته‌بندی',
  },
  'admin.products.write': {
    labelFa: 'ویرایش محصولات',
    hintFa: 'ایجاد/ویرایش محصول و صفحات دسته‌بندی (بنر Hero)',
  },
  'admin.products.delete': {
    labelFa: 'حذف محصولات',
  },
  'admin.products.publish': {
    labelFa: 'انتشار محصولات',
  },
  'admin.products.videos.read': {
    labelFa: 'مشاهده ویدیوهای محصول',
  },
  'admin.inventory.read': {
    labelFa: 'مشاهده موجودی',
    hintFa: 'موجودی انبار و گزارش موجودی',
  },
  'admin.inventory.adjust': {
    labelFa: 'تعدیل موجودی',
  },
  'admin.orders.read': {
    labelFa: 'مشاهده سفارش‌ها',
    hintFa: 'سفارش‌ها و کوپن‌ها',
  },
  'admin.orders.write': {
    labelFa: 'ویرایش سفارش‌ها',
  },
  'admin.orders.refund': {
    labelFa: 'استرداد سفارش',
  },
  'admin.orders.ship': {
    labelFa: 'ثبت ارسال سفارش',
  },
  'admin.trading.read': {
    labelFa: 'مشاهده معاملات طلا',
  },
  'admin.trading.settle': {
    labelFa: 'تسویه معاملات',
  },
  'admin.pricing.read': {
    labelFa: 'مشاهده قیمت زنده',
  },
  'admin.pricing.configure': {
    labelFa: 'پیکربندی قیمت‌گذاری',
    hintFa: 'ارائه‌دهندگان و حاشیه سود',
  },
  'admin.pricing.override': {
    labelFa: 'بازنویسی قیمت',
  },
  'admin.users.read': {
    labelFa: 'مشاهده کاربران',
  },
  'admin.users.write': {
    labelFa: 'ویرایش کاربران',
  },
  'admin.kyc.read': {
    labelFa: 'مشاهده درخواست‌های KYC',
  },
  'admin.kyc.review': {
    labelFa: 'بررسی و تأیید KYC',
  },
  'admin.finance.read': {
    labelFa: 'مشاهده مالی',
    hintFa: 'کیف پول‌ها و تراکنش‌ها',
  },
  'admin.finance.adjust': {
    labelFa: 'تعدیل مالی',
  },
  'admin.finance.transactions.read': {
    labelFa: 'مشاهده تراکنش‌های مالی',
  },
  'admin.finance.reports': {
    labelFa: 'گزارش‌های مالی',
  },
  'admin.ledger.read': {
    labelFa: 'مشاهده دفتر کل',
    hintFa: 'دفتر کل و حسابداری',
  },
  'admin.cms.read': {
    labelFa: 'مشاهده محتوا',
    hintFa: 'وبلاگ و صفحات ثابت',
  },
  'admin.cms.write': {
    labelFa: 'ویرایش محتوا',
    hintFa: 'صفحه اصلی، بنر، لنز، ست‌ها، FAQ، SEO، درباره ما',
  },
  'admin.media.read': {
    labelFa: 'مشاهده کتابخانه رسانه',
  },
  'admin.media.write': {
    labelFa: 'آپلود و مدیریت رسانه',
    hintFa: 'آپلود تصویر و برش در کادر ابعاد',
  },
  'admin.reports.view': {
    labelFa: 'مشاهده گزارش‌ها',
  },
  'admin.reports.export': {
    labelFa: 'خروجی گرفتن از گزارش‌ها',
  },
  'admin.security.audit': {
    labelFa: 'مشاهده لاگ ممیزی',
    hintFa: 'شامل تاریخچه ورود',
  },
  'admin.security.sessions': {
    labelFa: 'مدیریت نشست‌ها',
  },
  'admin.security.rbac': {
    labelFa: 'مدیریت نقش‌ها و دسترسی',
  },
  'admin.settings.read': {
    labelFa: 'مشاهده تنظیمات',
  },
  'admin.settings.write': {
    labelFa: 'ویرایش تنظیمات',
    hintFa: 'تجارت، طلا و قابلیت‌ها (مثل لیست علاقه‌مندی)',
  },
};

export const ADMIN_PERMISSION_GROUP_ORDER = [
  'dashboard',
  'notifications',
  'products',
  'inventory',
  'orders',
  'trading',
  'pricing',
  'users',
  'kyc',
  'finance',
  'ledger',
  'cms',
  'media',
  'reports',
  'security',
  'settings',
] as const satisfies readonly (keyof typeof ADMIN_PERMISSIONS)[];

export function getAdminPermissionGroups(): Array<{
  id: keyof typeof ADMIN_PERMISSIONS;
  labelFa: string;
  permissions: AdminPermissionKey[];
}> {
  return ADMIN_PERMISSION_GROUP_ORDER.map((groupId) => ({
    id: groupId,
    labelFa: ADMIN_PERMISSION_GROUP_LABELS[groupId],
    permissions: Object.values(ADMIN_PERMISSIONS[groupId]),
  }));
}
