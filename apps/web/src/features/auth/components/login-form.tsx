'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getApiErrorMessage } from '@/lib/api';
import {
  useOtpRequestMutation,
  usePasswordLoginMutation,
} from '@/features/auth/hooks/use-auth';
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
  const [mode, setMode] = useState<'otp' | 'password'>('password');
  const otpMutation = useOtpRequestMutation(next);
  const loginMutation = usePasswordLoginMutation(next);

  const otpForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { identifier: '' },
  });

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpError =
    otpMutation.error && getApiErrorMessage(otpMutation.error, 'ارسال کد تأیید ناموفق بود');
  const passwordError =
    loginMutation.error && getApiErrorMessage(loginMutation.error, 'ورود ناموفق بود');

  return (
    <div className="auth-form-wrap">
      {otpEnabled ? (
        <div className="auth-mode-toggle" role="tablist" aria-label="روش ورود">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'otp'}
            className={`auth-mode-toggle-btn${mode === 'otp' ? ' auth-mode-toggle-btn--active' : ''}`}
            onClick={() => setMode('otp')}
          >
            ورود با OTP
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'password'}
            className={`auth-mode-toggle-btn${mode === 'password' ? ' auth-mode-toggle-btn--active' : ''}`}
            onClick={() => setMode('password')}
          >
            ورود با رمز
          </button>
        </div>
      ) : null}

      {otpEnabled && mode === 'otp' ? (
        <form
          className="auth-form"
          onSubmit={otpForm.handleSubmit((values) => otpMutation.mutate(values))}
        >
          <label className="auth-field" htmlFor="identifier">
            <span className="auth-field-label">موبایل یا ایمیل</span>
            <input
              id="identifier"
              className="auth-input"
              inputMode="email"
              placeholder="0912xxxxxxx یا you@example.com"
              {...otpForm.register('identifier')}
            />
            {otpForm.formState.errors.identifier ? (
              <span className="auth-field-error">{otpForm.formState.errors.identifier.message}</span>
            ) : null}
          </label>
          <button type="submit" className="auth-submit" disabled={otpMutation.isPending}>
            {otpMutation.isPending ? 'در حال ارسال...' : 'دریافت کد تأیید'}
          </button>
          {otpError ? <p className="auth-form-error">{otpError}</p> : null}
        </form>
      ) : (
        <form
          className="auth-form"
          onSubmit={passwordForm.handleSubmit((values) => loginMutation.mutate(values))}
        >
          <label className="auth-field" htmlFor="email">
            <span className="auth-field-label">ایمیل</span>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              autoComplete="email"
              {...passwordForm.register('email')}
            />
            {passwordForm.formState.errors.email ? (
              <span className="auth-field-error">{passwordForm.formState.errors.email.message}</span>
            ) : null}
          </label>
          <label className="auth-field" htmlFor="password">
            <span className="auth-field-label">رمز عبور</span>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete="current-password"
              {...passwordForm.register('password')}
            />
            {passwordForm.formState.errors.password ? (
              <span className="auth-field-error">{passwordForm.formState.errors.password.message}</span>
            ) : null}
          </label>
          <button type="submit" className="auth-submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'در حال ورود...' : 'ورود به حساب'}
          </button>
          {passwordError ? <p className="auth-form-error">{passwordError}</p> : null}
        </form>
      )}
    </div>
  );
}
