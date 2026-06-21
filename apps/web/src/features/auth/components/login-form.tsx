'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getApiErrorMessage } from '@/lib/api';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import {
  useOtpRequestMutation,
  usePasswordLoginMutation,
} from '@/features/auth/hooks/use-auth';
import { isValidIranMobile, normalizeIranPhone } from '@/features/auth/lib/phone';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import {
  otpRequestSchema,
  passwordLoginSchema,
  type OtpRequestValues,
  type PasswordLoginValues,
} from '@/features/auth/model/schemas';

interface LoginFormProps {
  next?: string | null;
}

export function LoginForm({ next }: LoginFormProps) {
  const otpEnabled = useFeatureFlag('enableOtpLogin');
  const [mode, setMode] = useState<'otp' | 'password'>(otpEnabled ? 'otp' : 'password');
  const otpMutation = useOtpRequestMutation(next);
  const loginMutation = usePasswordLoginMutation(next);

  const otpForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { identifier: '' },
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const otpIdentifier = otpForm.watch('identifier');

  const otpError =
    otpMutation.error && getApiErrorMessage(otpMutation.error, 'ارسال کد تأیید ناموفق بود');
  const passwordError =
    loginMutation.error && getApiErrorMessage(loginMutation.error, 'ورود ناموفق بود');

  const otpCanSubmit = isValidIranMobile(otpIdentifier);
  const passwordCanSubmit = passwordForm.formState.isValid;

  return (
    <div className="auth-form-wrap">
      {otpEnabled ? (
        <div className="auth-tabs" role="tablist" aria-label="روش ورود">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'otp'}
            className={`auth-tab${mode === 'otp' ? ' auth-tab--active' : ''}`}
            onClick={() => setMode('otp')}
          >
            ورود با رمز یکبار مصرف
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'password'}
            className={`auth-tab${mode === 'password' ? ' auth-tab--active' : ''}`}
            onClick={() => setMode('password')}
          >
            ورود با رمزعبور
          </button>
        </div>
      ) : null}

      {otpEnabled && mode === 'otp' ? (
        <form
          className="auth-form"
          onSubmit={otpForm.handleSubmit((values) =>
            otpMutation.mutate({
              identifier: normalizeIranPhone(values.identifier),
            }),
          )}
        >
          <Controller
            control={otpForm.control}
            name="identifier"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="identifier"
                label="تلفن همراه"
                value={field.value}
                onChange={(value) => field.onChange(normalizeIranPhone(value).slice(0, 11))}
                onBlur={field.onBlur}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                numeric
                error={fieldState.error?.message}
              />
            )}
          />

          <p className="auth-terms">
            ورود به منزله قبول{' '}
            <Link href="/policies" className="auth-terms-link">
              قوانین و مقررات
            </Link>{' '}
            طلاشیم می باشد.
          </p>

          <AuthSubmitButton
            isEnabled={otpCanSubmit}
            isPending={otpMutation.isPending}
            pendingLabel="در حال ارسال"
          >
            ادامه
          </AuthSubmitButton>

          {otpError ? <AuthAlert variant="error">{otpError}</AuthAlert> : null}
        </form>
      ) : (
        <form
          className="auth-form"
          onSubmit={passwordForm.handleSubmit((values) => loginMutation.mutate(values))}
        >
          <p className="auth-form-hint">اطلاعات زیر را وارد نمائید</p>

          <Controller
            control={passwordForm.control}
            name="email"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="email"
                label="تلفن همراه"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="email"
                inputMode="email"
                autoComplete="email"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={passwordForm.control}
            name="password"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="password"
                label="رمز عبور"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="password"
                autoComplete="current-password"
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="auth-forgot-password-row">
            <Link href="/contact" className="auth-forgot-password">
              فراموشی رمزعبور
            </Link>
          </div>

          <p className="auth-terms">
            ورود به منزله قبول{' '}
            <Link href="/policies" className="auth-terms-link">
              قوانین و مقررات
            </Link>{' '}
            طلاشیم می باشد.
          </p>

          <AuthSubmitButton
            isEnabled={passwordCanSubmit}
            isPending={loginMutation.isPending}
            pendingLabel="در حال ورود"
          >
            ادامه
          </AuthSubmitButton>

          {passwordError ? <AuthAlert variant="error">{passwordError}</AuthAlert> : null}
        </form>
      )}
    </div>
  );
}
