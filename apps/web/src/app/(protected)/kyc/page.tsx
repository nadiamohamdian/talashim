import { ProtectedPageShell } from '@/widgets/content/protected-page-shell';
import { KycContent } from '@/features/account/components/kyc-content';

export default function KycPage() {
  return (
    <ProtectedPageShell
      title="احراز هویت (KYC)"
      description="تکمیل مدارک برای معاملات و برداشت."
    >
      <KycContent />
    </ProtectedPageShell>
  );
}
