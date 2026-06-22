import { AccountShell } from '@/widgets/account/account-shell';
import { PasswordContent } from '@/features/account/components/password-content';

export default function PasswordPage() {
  return (
    <AccountShell
      title="رمز عبور"
      description="تعیین یا تغییر رمز ورود به حساب کاربری"
      returnPath="/profile/password"
    >
      <PasswordContent />
    </AccountShell>
  );
}
