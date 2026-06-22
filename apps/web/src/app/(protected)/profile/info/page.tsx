import { AccountShell } from '@/widgets/account/account-shell';
import { ProfileContent } from '@/features/account/components/profile-content';

export default function ProfileInfoPage() {
  return (
    <AccountShell title="اطلاعات کاربری" returnPath="/profile/info">
      <ProfileContent />
    </AccountShell>
  );
}
