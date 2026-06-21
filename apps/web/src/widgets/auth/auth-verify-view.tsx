import { Suspense } from 'react';
import { AuthSessionRedirect } from '@/features/auth/components/auth-session-redirect';
import { OtpVerifyForm } from '@/features/auth/components/otp-verify-form';
import { AuthPageShell } from '@/widgets/auth/auth-page-shell';

export function AuthVerifyView() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthSessionRedirect />
      </Suspense>
      <AuthPageShell sectionTitle="">
        <Suspense fallback={null}>
          <OtpVerifyForm />
        </Suspense>
      </AuthPageShell>
    </>
  );
}
