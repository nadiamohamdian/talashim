import { AccountShell } from '@/widgets/account/account-shell';
import { ProfileContent } from '@/features/account/components/profile-content';

export default function ProfilePage() {
  return (
    <AccountShell
      title="اطلاعات حساب"
      description="مشخصات شخصی، تماس و تنظیمات حساب کاربری"
      returnPath="/profile"
    >
      <ProfileContent />
    </AccountShell>
  );
}
