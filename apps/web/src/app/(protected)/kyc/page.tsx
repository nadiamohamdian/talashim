import { AccountShell } from '@/widgets/account/account-shell';
import { KycContent } from '@/features/account/components/kyc-content';

export default function KycPage() {
  return (
    <AccountShell
      title="احراز هویت (KYC)"
      description="تکمیل مدارک برای معاملات و برداشت."
      returnPath="/kyc"
    >
      <KycContent />
    </AccountShell>
  );
}
