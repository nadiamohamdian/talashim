'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { completeAccountSetupSchema, type CompleteAccountSetupValues } from '@sadafgold/shared/validation/auth';
import { isPlaceholderPhoneEmail } from '@talashim/shared/auth/placeholder-email';
import { useSearchParams, useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { refreshSession } from '@/features/auth/api/auth-api';
import { persistAuthSessionSync } from '@/features/auth/lib/persist-auth-session';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { userApi } from '@/lib/api/user.api';
import { getApiErrorMessage } from '@/lib/api';
import { resolvePostLoginPath } from '@/shared/routing/safe-redirect';

export function AccountSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const { user } = useAuth();
  const showEmail = !user?.email || isPlaceholderPhoneEmail(user.email);
  const requirePassword = Boolean(user?.requiresPasswordSetup);

  const form = useForm<CompleteAccountSetupValues>({
    resolver: zodResolver(completeAccountSetupSchema),
    defaultValues: {
      email: showEmail ? '' : user?.email ?? '',
      newPassword: '',
      confirmPassword: '',
      requirePassword,
    },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: (values: CompleteAccountSetupValues) =>
      userApi.completeOnboarding({
        email: values.email.trim().toLowerCase(),
        ...(requirePassword && values.newPassword
          ? { newPassword: values.newPassword }
          : {}),
      }),
    onSuccess: async () => {
      try {
        const session = await refreshSession();
        persistAuthSessionSync(session);
      } catch {
        const state = useAuthStore.getState();
        if (state.user && state.accessToken && state.refreshToken) {
          state.setSession({
            user: {
              ...state.user,
              requiresPasswordSetup: false,
              requiresEmailSetup: false,
            },
            tokens: {
              accessToken: state.accessToken,
              refreshToken: state.refreshToken,
            },
          });
        }
      }
      router.replace(resolvePostLoginPath(next));
    },
  });

  const apiError =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'تکمیل اطلاعات حساب ناموفق بود');

  return (
    <form
      className="auth-form"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <p className="auth-form-hint">
        {requirePassword
          ? 'برای ادامه، ایمیل و رمز عبور حساب خود را تعیین کنید.'
          : 'برای ادامه، ایمیل حساب خود را وارد کنید.'}
      </p>

      {showEmail ? (
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <AuthFloatingInput
              id="email"
              label="ایمیل"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              type="email"
              autoComplete="email"
              error={fieldState.error?.message}
            />
          )}
        />
      ) : (
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => <input type="hidden" {...field} />}
        />
      )}

      {requirePassword ? (
        <>
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="newPassword"
                label="رمز عبور"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="password"
                autoComplete="new-password"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="confirmPassword"
                label="تکرار رمز عبور"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                type="password"
                autoComplete="new-password"
                error={fieldState.error?.message}
              />
            )}
          />
        </>
      ) : null}

      <AuthSubmitButton
        isEnabled={form.formState.isValid}
        isPending={mutation.isPending}
        pendingLabel="در حال ذخیره"
      >
        ادامه
      </AuthSubmitButton>

      {apiError ? <AuthAlert variant="error">{apiError}</AuthAlert> : null}
    </form>
  );
}
