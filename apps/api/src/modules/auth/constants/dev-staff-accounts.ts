import { Role } from '@/generated/prisma';

export const DEV_STAFF_ACCOUNTS: Record<
  string,
  { role: Role; fullName: string; defaultPassword: string }
> = {
  'admin@talashim.local': {
    role: Role.SUPER_ADMIN,
    fullName: 'سوپر ادمین',
    defaultPassword: 'Admin12345!',
  },
  'support@talashim.local': {
    role: Role.SUPPORT,
    fullName: 'پشتیبان سایت',
    defaultPassword: 'Admin12345!',
  },
  'accountant@talashim.local': {
    role: Role.ACCOUNTANT,
    fullName: 'حسابدار',
    defaultPassword: 'Admin12345!',
  },
  'editor@talashim.local': {
    role: Role.EDITOR,
    fullName: 'ادیتور',
    defaultPassword: 'Admin12345!',
  },
  'warehouse@talashim.local': {
    role: Role.WAREHOUSE,
    fullName: 'انباردار',
    defaultPassword: 'Admin12345!',
  },
};
