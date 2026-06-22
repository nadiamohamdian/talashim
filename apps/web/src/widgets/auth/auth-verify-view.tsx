import { Suspense } from 'react';
import { AuthSessionRedirect } from '@/features/auth/components/auth-session-redirect';
import { OtpVerifyForm, OtpVerifySuccessAlert } from '@/features/auth/components/otp-verify-form';
import { AuthPageShell } from '@/widgets/auth/auth-page-shell';

export function AuthVerifyView() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthSessionRedirect />
      </Suspense>
      <AuthPageShell
        variant="verify"
        verifyAlert={
          <Suspense fallback={null}>
            <OtpVerifySuccessAlert />
          </Suspense>
        }
      >
        <Suspense fallback={null}>
          <OtpVerifyForm />
        </Suspense>
      </AuthPageShell>
    </>
  );
}
