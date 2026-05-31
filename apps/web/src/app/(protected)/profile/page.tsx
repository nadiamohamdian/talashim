import { AccountShell } from '@/widgets/account/account-shell';
import { ProfileContent } from '@/features/account/components/profile-content';

export default function ProfilePage() {
  return (
    <AccountShell
      title="اطلاعات حساب کاربری"
      description="اطلاعات شخصی و تنظیمات حساب."
      returnPath="/profile"
    >
      <ProfileContent />
    </AccountShell>
  );
}
