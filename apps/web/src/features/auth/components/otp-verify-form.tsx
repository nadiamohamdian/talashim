'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getApiErrorMessage } from '@/lib/api';
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
  });

  useEffect(() => {
    if (identifier) {
      form.setValue('identifier', identifier);
    }
  }, [identifier, form]);

  const error =
    verifyMutation.error && getApiErrorMessage(verifyMutation.error, 'کد تأیید نامعتبر است');

  return (
    <form
      className="auth-form"
      onSubmit={form.handleSubmit((values) => verifyMutation.mutate(values))}
    >
      <label className="auth-field" htmlFor="identifier">
        <span className="auth-field-label">موبایل یا ایمیل</span>
        <input id="identifier" className="auth-input auth-input--readonly" readOnly {...form.register('identifier')} />
      </label>
      <label className="auth-field" htmlFor="code">
        <span className="auth-field-label">کد ۶ رقمی</span>
        <input
          id="code"
          className="auth-input auth-input--code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          autoComplete="one-time-code"
          {...form.register('code')}
        />
        {form.formState.errors.code ? (
          <span className="auth-field-error">{form.formState.errors.code.message}</span>
        ) : null}
      </label>
      <button type="submit" className="auth-submit" disabled={verifyMutation.isPending}>
        {verifyMutation.isPending ? 'در حال تأیید...' : 'تأیید و ورود'}
      </button>
      {error ? <p className="auth-form-error">{error}</p> : null}
      <Link href="/login" className="auth-back-link">
        بازگشت به ورود
      </Link>
    </form>
  );
}
