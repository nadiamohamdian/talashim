import { Suspense } from 'react';
import { Card } from '@sadafgold/ui';
import { AuthSessionRedirect } from '@/features/auth/components/auth-session-redirect';
import { OtpVerifyForm } from '@/features/auth/components/otp-verify-form';

export default function OtpVerifyPage() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Suspense fallback={null}>
        <AuthSessionRedirect />
      </Suspense>
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-medium text-amber-700">تأیید OTP</p>
        <h1 className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl dark:text-zinc-50">
          کد تأیید را وارد کنید
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-zinc-400">
          کد ۶ رقمی ارسال‌شده را وارد کنید.
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-stone-500">در حال بارگذاری...</p>}>
            <OtpVerifyForm />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
