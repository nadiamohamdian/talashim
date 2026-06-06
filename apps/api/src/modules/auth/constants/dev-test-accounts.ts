import { Role } from '@/generated/prisma';

export const DEV_PASSWORD_STAFF = 'Admin12345!';
export const DEV_PASSWORD_CUSTOMER = 'Customer12345!';

/** @deprecated Import from dev-test-accounts */
export const DEV_STAFF_ACCOUNTS: Record<
  string,
  { role: Role; fullName: string; defaultPassword: string }
> = {
  'admin@talashim.local': {
    role: Role.SUPER_ADMIN,
    fullName: 'سوپر ادمین',
    defaultPassword: DEV_PASSWORD_STAFF,
  },
  'support@talashim.local': {
    role: Role.SUPPORT,
    fullName: 'پشتیبان سایت',
    defaultPassword: DEV_PASSWORD_STAFF,
  },
  'accountant@talashim.local': {
    role: Role.ACCOUNTANT,
    fullName: 'حسابدار',
    defaultPassword: DEV_PASSWORD_STAFF,
  },
  'editor@talashim.local': {
    role: Role.EDITOR,
    fullName: 'ادیتور',
    defaultPassword: DEV_PASSWORD_STAFF,
  },
  'warehouse@talashim.local': {
    role: Role.WAREHOUSE,
    fullName: 'انباردار',
    defaultPassword: DEV_PASSWORD_STAFF,
  },
};

export const DEV_CUSTOMER_ACCOUNT = {
  email: 'customer@talashim.local',
  fullName: 'مشتری فروشگاه',
  defaultPassword: DEV_PASSWORD_CUSTOMER,
  otpPhone: '09121234567',
  nationalId: '0012345678',
  role: Role.CUSTOMER,
} as const;

export type DevTestAccount = {
  role: string;
  email: string;
  password: string;
  label: string;
};

export const DEV_TEST_ACCOUNTS: DevTestAccount[] = [
  ...Object.entries(DEV_STAFF_ACCOUNTS).map(([email, account]) => ({
    role: account.role,
    email,
    password: account.defaultPassword,
    label: account.fullName,
  })),
  {
    role: DEV_CUSTOMER_ACCOUNT.role,
    email: DEV_CUSTOMER_ACCOUNT.email,
    password: DEV_CUSTOMER_ACCOUNT.defaultPassword,
    label: DEV_CUSTOMER_ACCOUNT.fullName,
  },
];
