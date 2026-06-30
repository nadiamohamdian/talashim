import { Suspense } from 'react';
import { AccountSetupForm } from '@/features/auth/components/account-setup-form';
import { AccountSetupSessionGuard } from '@/features/auth/components/account-setup-session-guard';
import { AuthPageShell } from '@/widgets/auth/auth-page-shell';

export function AuthSetupView() {
  return (
    <AuthPageShell sectionTitle="تکمیل ثبت‌نام">
      <Suspense fallback={null}>
        <AccountSetupSessionGuard>
          <AccountSetupForm />
        </AccountSetupSessionGuard>
      </Suspense>
    </AuthPageShell>
  );
}
