'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getApiErrorMessage } from '@/lib/api';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useOtpVerifyMutation } from '@/features/auth/hooks/use-auth';
import { otpVerifySchema, type OtpVerifyValues } from '@/features/auth/model/schemas';

export function OtpVerifyForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const identifier = searchParams.get('identifier') ?? '';
  const verifyMutation = useOtpVerifyMutation(next);

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

  return (
    <form
      className="auth-form"
      onSubmit={form.handleSubmit((values) => verifyMutation.mutate(values))}
    >
      <p className="auth-form-hint">کد ۶ رقمی ارسال‌شده را وارد نمائید</p>

      <Controller
        control={form.control}
        name="identifier"
        render={({ field }) => (
          <AuthFloatingInput
            id="verify-identifier"
            label="تلفن همراه"
            value={field.value}
            onChange={field.onChange}
            readOnly
            numeric
          />
        )}
      />

      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <AuthFloatingInput
            id="code"
            label="کد تأیید"
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

      {identifier ? (
        <AuthAlert variant="success">کد تائید ارسال شد</AuthAlert>
      ) : null}

      <AuthSubmitButton
        isEnabled={canSubmit}
        isPending={verifyMutation.isPending}
        pendingLabel="در حال تأیید"
      >
        ادامه
      </AuthSubmitButton>

      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
    </form>
  );
}
