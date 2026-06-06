'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@sadafgold/ui';
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
    <div className="space-y-6">
      {otpEnabled ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              mode === 'otp' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'
            }`}
            onClick={() => setMode('otp')}
          >
            ورود با OTP
          </button>
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              mode === 'password' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'
            }`}
            onClick={() => setMode('password')}
          >
            ورود با رمز
          </button>
        </div>
      ) : null}

      {otpEnabled && mode === 'otp' ? (
        <form
          className="space-y-4"
          onSubmit={otpForm.handleSubmit((values) => otpMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="identifier">موبایل یا ایمیل</Label>
            <Input
              id="identifier"
              inputMode="email"
              placeholder="0912xxxxxxx یا you@example.com"
              {...otpForm.register('identifier')}
            />
            {otpForm.formState.errors.identifier ? (
              <p className="text-sm text-red-600">{otpForm.formState.errors.identifier.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={otpMutation.isPending}>
            {otpMutation.isPending ? 'در حال ارسال...' : 'دریافت کد تأیید'}
          </Button>
          {otpError ? <p className="text-sm text-red-600">{otpError}</p> : null}
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={passwordForm.handleSubmit((values) => loginMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...passwordForm.register('email')} />
            {passwordForm.formState.errors.email ? (
              <p className="text-sm text-red-600">{passwordForm.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input id="password" type="password" placeholder="••••••••" {...passwordForm.register('password')} />
            {passwordForm.formState.errors.password ? (
              <p className="text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'در حال ورود...' : 'ورود به حساب'}
          </Button>
          {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
        </form>
      )}
    </div>
  );
}
