'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidIranMobile, isValidIranNationalId } from '@sadafgold/shared';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useAddresses } from '@/features/account/hooks/use-addresses';
import {
  resolveProfileDisplayName,
  resolveProfilePhone,
} from '@/features/account/lib/profile-display';
import { useProfile, useUpdateProfileMutation } from '@/features/account/hooks/use-profile';
import { getApiErrorMessage } from '@/lib/api';

const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().trim().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalId: z
    .string()
    .regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد')
    .refine(isValidIranNationalId, 'کد ملی معتبر نیست'),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد')
    .refine(isValidIranMobile, 'شماره موبایل معتبر نیست'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function formatAddressLine(
  addresses: Array<{ line1: string; city: string }> | undefined,
): string {
  if (!addresses?.length) {
    return '';
  }

  const address = addresses[0];
  return [address.line1, address.city].filter(Boolean).join('، ');
}

function resolveKycBadgeClass(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return 'profile-badge profile-badge--approved';
    case 'rejected':
      return 'profile-badge profile-badge--rejected';
    default:
      return 'profile-badge profile-badge--pending';
  }
}

function resolveKycLabel(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return 'احراز هویت تأیید شده';
    case 'rejected':
      return 'احراز هویت رد شده';
    case 'pending':
      return 'در انتظار احراز هویت';
    default:
      return 'احراز هویت ثبت نشده';
  }
}

export function ProfileContent() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: addresses } = useAddresses();
  const mutation = useUpdateProfileMutation();

  function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
    };
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', nationalId: '', phone: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    const split = splitFullName(resolveProfileDisplayName(profile));
    form.reset({
      firstName: profile.firstName ?? split.firstName,
      lastName: profile.lastName ?? split.lastName,
      nationalId: profile.nationalId ?? '',
      phone: resolveProfilePhone(profile) ?? '',
    });
  }, [profile, form]);

  if (isLoading) {
    return (
      <div className="profile-page-content" aria-busy="true">
        <div className="profile-skeleton profile-skeleton--hero" />
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

  const addressLine = formatAddressLine(addresses);
  const apiError =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'به‌روزرسانی اطلاعات حساب ناموفق بود');

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        nationalId: values.nationalId.trim(),
        phone: values.phone.trim() || undefined,
      },
      {
        onSuccess: (updatedProfile) => {
          const split = splitFullName(resolveProfileDisplayName(updatedProfile));
          form.reset({
            firstName: updatedProfile.firstName ?? split.firstName,
            lastName: updatedProfile.lastName ?? split.lastName,
            nationalId: updatedProfile.nationalId ?? '',
            phone: resolveProfilePhone(updatedProfile) ?? '',
          });
        },
      },
    );
  });

  return (
    <div className="profile-page-content">
      <section className="profile-hero" aria-label="خلاصه حساب کاربری">
        <div className="profile-hero-copy">
          <p className="profile-hero-eyebrow">حساب کاربری</p>
          <h2 className="profile-hero-name">{resolveProfileDisplayName(profile)}</h2>
          {resolveProfilePhone(profile) ? (
            <p className="profile-hero-meta">{resolveProfilePhone(profile)}</p>
          ) : null}
        </div>
        <div className="profile-badges">
          <span className={resolveKycBadgeClass(profile.kycStatus)}>
            {resolveKycLabel(profile.kycStatus)}
          </span>
        </div>
      </section>

      <section className="profile-form" aria-label="ویرایش اطلاعات حساب">
        <header className="profile-form-header">
          <h2 className="profile-form-title">اطلاعات تماس</h2>
          <p className="profile-form-lead">برای تحویل سفارش و ارتباط با شما از این اطلاعات استفاده می‌شود.</p>
        </header>

        <form onSubmit={onSubmit}>
          <div className="profile-form-grid">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="نام"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  autoComplete="given-name"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="نام خانوادگی"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  autoComplete="family-name"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="nationalId"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="کد ملی"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={10}
                  numeric
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthFloatingInput
                  label="شماره موبایل"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={11}
                  numeric
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="profile-form-grid profile-form-grid--single">
            <AuthFloatingInput
              label="آدرس"
              value={addressLine}
              onChange={() => undefined}
              readOnly
            />
            {!addressLine ? (
              <p className="profile-field-note">برای ثبت آدرس به بخش «آدرس» در پنل کاربری بروید.</p>
            ) : null}
          </div>

          {mutation.isSuccess ? (
            <AuthAlert variant="success">اطلاعات با موفقیت ذخیره شد.</AuthAlert>
          ) : null}
          {apiError ? <AuthAlert variant="error">{apiError}</AuthAlert> : null}

          <div className="profile-form-actions">
            <AuthSubmitButton
              isEnabled={form.formState.isDirty && form.formState.isValid}
              isPending={mutation.isPending}
              pendingLabel="در حال ذخیره"
            >
              ذخیره تغییرات
            </AuthSubmitButton>
          </div>
        </form>
      </section>

      <section className="profile-form" aria-label="مدیریت رمز عبور">
        <header className="profile-form-header">
          <h2 className="profile-form-title">رمز عبور</h2>
          <p className="profile-form-lead">
            {profile.requiresPasswordSetup
              ? 'هنوز رمز عبور تعیین نکرده‌اید. برای ورود با رمز عبور، یک رمز امن انتخاب کنید.'
              : 'رمز عبور خود را می‌توانید از بخش مدیریت رمز عبور تغییر دهید.'}
          </p>
        </header>
        <div className="profile-form-actions">
          <Link href="/profile/password" className="auth-submit auth-submit--active">
            {profile.requiresPasswordSetup ? 'تعیین رمز عبور' : 'تغییر رمز عبور'}
          </Link>
        </div>
      </section>
    </div>
  );
}
