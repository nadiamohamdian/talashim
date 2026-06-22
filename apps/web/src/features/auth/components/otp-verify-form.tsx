'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api';
import { requestOtp } from '@/features/auth/api/auth-api';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { IconAuthEditPhone, IconAuthResend } from '@/features/auth/components/auth-otp-icons';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useOtpVerifyMutation } from '@/features/auth/hooks/use-auth';
import { useOtpCountdown } from '@/features/auth/hooks/use-otp-countdown';
import { otpVerifySchema, type OtpVerifyValues } from '@/features/auth/model/schemas';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

export function OtpVerifySuccessAlert() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') ?? '';

  if (!identifier) {
    return null;
  }

  return <AuthAlert variant="success">کد تائید ارسال شد</AuthAlert>;
}

export function OtpVerifyForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const identifier = searchParams.get('identifier') ?? '';
  const { formatted: timerLabel, canResend, reset: resetTimer } = useOtpCountdown(identifier);
  const verifyMutation = useOtpVerifyMutation(next);
  const resendMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (data) => {
      resetTimer(data.expiresInSeconds);
    },
  });

  const form = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { identifier, code: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (identifier) {
      form.setValue('identifier', identifier);
    }
  }, [identifier, form]);

  const code = form.watch('code');
  const canSubmit = /^\d{6}$/.test(code);

  const error =
    verifyMutation.error && getApiErrorMessage(verifyMutation.error, 'کد تأیید نامعتبر است');

  const resendError =
    resendMutation.error &&
    getApiErrorMessage(resendMutation.error, 'ارسال مجدد کد تأیید ناموفق بود');

  const editPhoneHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : '/login';

  const handleResend = () => {
    if (!identifier || !canResend || resendMutation.isPending) {
      return;
    }

    resendMutation.mutate({ identifier });
  };

  return (
    <form
      className="auth-form auth-otp-verify-form"
      onSubmit={form.handleSubmit((values) => verifyMutation.mutate(values))}
    >
      <h2 className="auth-section-title auth-otp-verify-heading">کد تائید</h2>

      <p className="auth-otp-verify-lead">
        {identifier ? (
          <>
            کد تایید ارسال شده به شماره موبایل{' '}
            <span className="auth-otp-verify-phone">{toPersianDigits(identifier)}</span> را وارد
            کنید.
          </>
        ) : (
          'کد تایید ارسال‌شده را وارد کنید.'
        )}
      </p>

      <div className="auth-otp-verify-meta">
        <span className="auth-otp-verify-timer" aria-live="polite">
          {timerLabel}
        </span>
        <Link href={editPhoneHref} className="auth-otp-verify-edit">
          <IconAuthEditPhone className="auth-otp-verify-edit-icon" />
          <span>اصلاح شماره موبایل</span>
        </Link>
      </div>

      <Controller
        control={form.control}
        name="identifier"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <AuthFloatingInput
            id="code"
            label="کد تائید"
            value={field.value}
            onChange={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 6))}
            onBlur={field.onBlur}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            numeric
            error={fieldState.error?.message}
          />
        )}
      />

      {canResend || resendMutation.isPending ? (
        <div className="auth-otp-resend-row">
          <button
            type="button"
            className="auth-otp-resend"
            disabled={!canResend || resendMutation.isPending || !identifier}
            onClick={handleResend}
          >
            <IconAuthResend className="auth-otp-resend-icon" />
            <span>{resendMutation.isPending ? 'در حال ارسال...' : 'ارسال مجدد'}</span>
          </button>
        </div>
      ) : null}

      <AuthSubmitButton
        isEnabled={canSubmit}
        isPending={verifyMutation.isPending}
        pendingLabel="در حال تأیید"
      >
        ادامه
      </AuthSubmitButton>

      {resendError ? <AuthAlert variant="error">{resendError}</AuthAlert> : null}
      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
    </form>
  );
}
