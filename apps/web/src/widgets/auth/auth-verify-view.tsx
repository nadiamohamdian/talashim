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
      <AuthPageShell
        eyebrow="تأیید OTP"
        title="کد تأیید را وارد کنید"
        description="کد ۶ رقمی ارسال‌شده را وارد کنید."
      >
        <Suspense fallback={<p className="auth-loading">در حال بارگذاری...</p>}>
          <OtpVerifyForm />
        </Suspense>
      </AuthPageShell>
    </>
  );
}
