import { AccountShell } from '@/widgets/account/account-shell';
import { ProfileContent } from '@/features/account/components/profile-content';

export default function ProfilePage() {
  return (
    <AccountShell title="اطلاعات حساب" returnPath="/profile">
      <ProfileContent />
    </AccountShell>
  );
}
