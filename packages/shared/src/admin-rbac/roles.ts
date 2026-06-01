import { ADMIN_PERMISSIONS, ALL_ADMIN_PERMISSIONS, type AdminPermissionKey } from './permissions';

/** Prisma / API enum values (UPPER_SNAKE). */
export const STAFF_ROLE_ENUM = [
  'SUPER_ADMIN',
  'SUPPORT',
  'ACCOUNTANT',
  'EDITOR',
  'WAREHOUSE',
] as const;

export type StaffRoleEnum = (typeof STAFF_ROLE_ENUM)[number];

/** Client session slug (lower_snake). */
export const STAFF_ROLE_SLUGS = [
  'super_admin',
  'support',
  'accountant',
  'editor',
  'warehouse',
] as const;

export type StaffRoleSlug = (typeof STAFF_ROLE_SLUGS)[number];

export type UserRoleSlug = StaffRoleSlug | 'customer';

export interface AdminRoleDefinition {
  enum: StaffRoleEnum;
  slug: StaffRoleSlug;
  labelFa: string;
  descriptionFa: string;
  permissions: readonly AdminPermissionKey[];
}

const P = ADMIN_PERMISSIONS;

const SUPER_ADMIN_PERMISSIONS: AdminPermissionKey[] = [...ALL_ADMIN_PERMISSIONS];

const SUPPORT_PERMISSIONS: AdminPermissionKey[] = [
  P.dashboard.view,
  P.users.read,
  P.kyc.read,
  P.orders.read,
  P.notifications.read,
];

const ACCOUNTANT_PERMISSIONS: AdminPermissionKey[] = [
  P.dashboard.view,
  P.products.read,
  P.orders.read,
];

const EDITOR_PERMISSIONS: AdminPermissionKey[] = [
  P.dashboard.view,
  P.products.read,
  P.products.write,
  P.products.publish,
  P.products.videos,
  P.cms.read,
  P.cms.write,
  P.media.read,
  P.media.write,
];

const WAREHOUSE_PERMISSIONS: AdminPermissionKey[] = [
  P.dashboard.view,
  P.orders.read,
  P.orders.ship,
  P.inventory.read,
];

export const ADMIN_ROLE_DEFINITIONS: readonly AdminRoleDefinition[] = [
  {
    enum: 'SUPER_ADMIN',
    slug: 'super_admin',
    labelFa: 'سوپر ادمین',
    descriptionFa: 'دسترسی کامل به تمام بخش‌های پنل و تنظیمات سیستم.',
    permissions: SUPER_ADMIN_PERMISSIONS,
  },
  {
    enum: 'SUPPORT',
    slug: 'support',
    labelFa: 'پشتیبان سایت',
    descriptionFa: 'مشاهده اطلاعات حساب کاربران، احراز هویت و سفارش‌ها.',
    permissions: SUPPORT_PERMISSIONS,
  },
  {
    enum: 'ACCOUNTANT',
    slug: 'accountant',
    labelFa: 'حسابدار',
    descriptionFa: 'فقط مشاهده محصولات، سفارش‌ها و گزارش‌های فروش.',
    permissions: ACCOUNTANT_PERMISSIONS,
  },
  {
    enum: 'EDITOR',
    slug: 'editor',
    labelFa: 'ادیتور',
    descriptionFa: 'ویرایش و انتشار محصولات، وبلاگ و رسانه.',
    permissions: EDITOR_PERMISSIONS,
  },
  {
    enum: 'WAREHOUSE',
    slug: 'warehouse',
    labelFa: 'انباردار',
    descriptionFa: 'مشاهده سفارش‌ها، ثبت ارسال و پیگیری موجودی انبار.',
    permissions: WAREHOUSE_PERMISSIONS,
  },
] as const;

const PERMISSIONS_BY_ENUM = new Map<StaffRoleEnum, readonly AdminPermissionKey[]>(
  ADMIN_ROLE_DEFINITIONS.map((role) => [role.enum, role.permissions]),
);

const PERMISSIONS_BY_SLUG = new Map<StaffRoleSlug, readonly AdminPermissionKey[]>(
  ADMIN_ROLE_DEFINITIONS.map((role) => [role.slug, role.permissions]),
);

const SLUG_BY_ENUM = new Map<string, StaffRoleSlug>(
  ADMIN_ROLE_DEFINITIONS.map((role) => [role.enum, role.slug]),
);

const ENUM_BY_SLUG = new Map<StaffRoleSlug, StaffRoleEnum>(
  ADMIN_ROLE_DEFINITIONS.map((role) => [role.slug, role.enum]),
);

const ROLE_LABEL_BY_SLUG = new Map<UserRoleSlug, string>([
  ['customer', 'مشتری'],
  ...ADMIN_ROLE_DEFINITIONS.map((role) => [role.slug, role.labelFa] as const),
]);

export function normalizeStaffRoleEnum(role: string | undefined): StaffRoleEnum | null {
  if (!role) {
    return null;
  }
  const upper = role.toUpperCase();
  if (upper === 'ADMIN') {
    return 'SUPER_ADMIN';
  }
  if ((STAFF_ROLE_ENUM as readonly string[]).includes(upper)) {
    return upper as StaffRoleEnum;
  }
  return null;
}

export function mapStaffRoleToSlug(role: string | undefined): UserRoleSlug {
  const staffEnum = normalizeStaffRoleEnum(role);
  if (staffEnum) {
    return SLUG_BY_ENUM.get(staffEnum) ?? 'customer';
  }
  const lower = role?.toLowerCase();
  if (lower === 'admin') {
    return 'super_admin';
  }
  if ((STAFF_ROLE_SLUGS as readonly string[]).includes(lower ?? '')) {
    return lower as StaffRoleSlug;
  }
  return 'customer';
}

export function mapStaffRoleToEnum(slug: string | undefined): StaffRoleEnum | null {
  if (!slug) {
    return null;
  }
  const normalized = slug.toLowerCase();
  if (normalized === 'admin') {
    return 'SUPER_ADMIN';
  }
  if ((STAFF_ROLE_SLUGS as readonly string[]).includes(normalized)) {
    return ENUM_BY_SLUG.get(normalized as StaffRoleSlug) ?? null;
  }
  const fromEnum = normalizeStaffRoleEnum(slug);
  return fromEnum;
}

export function isStaffRoleSlug(role: string | undefined): role is StaffRoleSlug {
  return (STAFF_ROLE_SLUGS as readonly string[]).includes(role ?? '');
}

export function isStaffRoleEnum(role: string | undefined): boolean {
  return normalizeStaffRoleEnum(role) !== null;
}

export function getRoleLabelFa(role: string | undefined): string {
  const slug = mapStaffRoleToSlug(role);
  return ROLE_LABEL_BY_SLUG.get(slug) ?? slug;
}

export function resolvePermissionsForRole(role: string | undefined): AdminPermissionKey[] {
  const staffEnum = normalizeStaffRoleEnum(role);
  if (staffEnum) {
    return [...(PERMISSIONS_BY_ENUM.get(staffEnum) ?? [])];
  }
  const slug = role?.toLowerCase();
  if (slug === 'admin') {
    return [...SUPER_ADMIN_PERMISSIONS];
  }
  if (slug && isStaffRoleSlug(slug)) {
    return [...(PERMISSIONS_BY_SLUG.get(slug) ?? [])];
  }
  return [];
}

export function hasAdminPermission(
  permissions: readonly AdminPermissionKey[],
  required: AdminPermissionKey,
): boolean {
  return permissions.includes(required);
}
