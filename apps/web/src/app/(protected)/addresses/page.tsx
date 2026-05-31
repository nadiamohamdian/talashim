import { AccountShell } from '@/widgets/account/account-shell';
import { AddressesContent } from '@/features/account/components/addresses-content';

export default function AddressesPage() {
  return (
    <AccountShell title="آدرس‌ها" description="آدرس‌های ذخیره‌شده برای ارسال." returnPath="/addresses">
      <AddressesContent />
    </AccountShell>
  );
}
