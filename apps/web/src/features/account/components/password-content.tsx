'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordValues } from '@sadafgold/shared/validation/auth';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useProfile, useChangePasswordMutation } from '@/features/account/hooks/use-profile';
import { getApiErrorMessage } from '@/lib/api';

function buildPasswordSchema(requiresSetup: boolean) {
  if (requiresSetup) {
    return changePasswordSchema;
  }

  return changePasswordSchema.safeExtend({
    currentPassword: z.string().min(8, 'رمز عبور فعلی الزامی است'),
  });
}

export function PasswordContent() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const mutation = useChangePasswordMutation();
  const requiresSetup = profile?.requiresPasswordSetup ?? true;
  const schema = buildPasswordSchema(requiresSetup);

  const form = useForm<ChangePasswordValues & { currentPassword?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  if (isLoading) {
    return (
      <div className="profile-page-content" aria-busy="true">
        <div className="profile-skeleton profile-skeleton--form" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="profile-page-content">
        <div className="profile-error-card">
          بارگذاری اطلاعات حساب ناموفق بود.
          <button type="button" className="profile-error-retry" onClick={() => refetch()}>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const apiError =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'به‌روزرسانی رمز عبور ناموفق بود');

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        newPassword: values.newPassword,
        currentPassword: requiresSetup ? undefined : values.currentPassword,
      },
      {
        onSuccess: () => {
          form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
      },
    );
  });

  return (
    <div className="profile-page-content">
      <section className="profile-form" aria-label="مدیریت رمز عبور">
        <header className="profile-form-header">
          <h2 className="profile-form-title">
            {requiresSetup ? 'تعیین رمز عبور' : 'تغییر رمز عبور'}
          </h2>
          <p className="profile-form-lead">
            {requiresSetup
              ? 'برای ورود با رمز عبور، یک رمز امن انتخاب کنید.'
              : 'برای تغییر رمز، ابتدا رمز فعلی و سپس رمز جدید را وارد کنید.'}
          </p>
        </header>

        <form onSubmit={onSubmit}>
          <div className="profile-form-grid profile-form-grid--single">
            {!requiresSetup ? (
              <Controller
                name="currentPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <AuthFloatingInput
                    label="رمز عبور فعلی"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="password"
                    autoComplete="current-password"
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : null}

            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="رمز عبور جدید"
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
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="تکرار رمز عبور جدید"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  type="password"
                  autoComplete="new-password"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          {mutation.isSuccess ? (
            <AuthAlert variant="success">رمز عبور با موفقیت ذخیره شد.</AuthAlert>
          ) : null}
          {apiError ? <AuthAlert variant="error">{apiError}</AuthAlert> : null}

          <div className="profile-form-actions">
            <AuthSubmitButton
              isEnabled={form.formState.isValid}
              isPending={mutation.isPending}
              pendingLabel="در حال ذخیره"
            >
              {requiresSetup ? 'تعیین رمز عبور' : 'ذخیره رمز جدید'}
            </AuthSubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
