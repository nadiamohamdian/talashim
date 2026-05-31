import { AccountPanel } from '@/features/auth/components/account-panel';

import { AccountShell } from '@/widgets/account/account-shell';



export default function AccountPage() {

  return (

    <AccountShell

      title="حساب کاربری"

      description="مدیریت پروفایل، تنظیمات و دسترسی سریع به بخش‌های حساب."

      returnPath="/account"

    >

      <AccountPanel />

    </AccountShell>

  );

}

