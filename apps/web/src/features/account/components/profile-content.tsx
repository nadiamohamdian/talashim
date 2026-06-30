'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isValidIranMobile, isValidIranNationalId } from '@sadafgold/shared';
import { isPlaceholderPhoneEmail } from '@sadafgold/shared/auth/placeholder-email';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useAddresses } from '@/features/account/hooks/use-addresses';
import {
  resolveProfileDisplayName,
  resolveProfilePhone,
} from '@/features/account/lib/profile-display';
import {
  useCompleteOnboardingMutation,
  useProfile,
  useUpdateProfileMutation,
} from '@/features/account/hooks/use-profile';
import { getApiErrorMessage } from '@/lib/api';

function buildProfileSchema(requiresEmail: boolean) {
  return z
    .object({
      email: requiresEmail
        ? z.email('ایمیل معتبر وارد کنید')
        : z.string().optional(),
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
}

type ProfileFormValues = z.infer<ReturnType<typeof buildProfileSchema>>;

function formatAddressLine(
  addresses: Array<{ line1: string; city: string }> | undefined,
): string {
  if (!addresses?.length) {
    return '';
  }

  const address = addresses[0];
  return [address?.line1, address?.city].filter(Boolean).join('، ');
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
  const updateMutation = useUpdateProfileMutation();
  const onboardingMutation = useCompleteOnboardingMutation();

  const requiresEmail =
    Boolean(profile?.requiresEmailSetup) ||
    Boolean(profile?.email && isPlaceholderPhoneEmail(profile.email));
  const profileSchema = useMemo(() => buildProfileSchema(requiresEmail), [requiresEmail]);

  function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
    };
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      nationalId: '',
      phone: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    const split = splitFullName(resolveProfileDisplayName(profile));
    form.reset({
      email: requiresEmail ? '' : profile.email,
      firstName: profile.firstName ?? split.firstName,
      lastName: profile.lastName ?? split.lastName,
      nationalId: profile.nationalId ?? '',
      phone: resolveProfilePhone(profile) ?? '',
    });
  }, [profile, form, requiresEmail]);

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
    (updateMutation.error || onboardingMutation.error) &&
    getApiErrorMessage(
      updateMutation.error ?? onboardingMutation.error,
      'به‌روزرسانی اطلاعات حساب ناموفق بود',
    );
  const saveSucceeded = updateMutation.isSuccess || onboardingMutation.isSuccess;
  const isSaving = updateMutation.isPending || onboardingMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (requiresEmail && values.email?.trim()) {
        await onboardingMutation.mutateAsync({
          email: values.email.trim().toLowerCase(),
        });
      }

      const updatedProfile = await updateMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        nationalId: values.nationalId.trim(),
        phone: values.phone.trim() || undefined,
      });

      const split = splitFullName(resolveProfileDisplayName(updatedProfile));
      form.reset({
        email: isPlaceholderPhoneEmail(updatedProfile.email)
          ? values.email?.trim() ?? ''
          : updatedProfile.email,
        firstName: updatedProfile.firstName ?? split.firstName,
        lastName: updatedProfile.lastName ?? split.lastName,
        nationalId: updatedProfile.nationalId ?? '',
        phone: resolveProfilePhone(updatedProfile) ?? '',
      });
    } catch {
      // Errors surface through mutation state.
    }
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
            {requiresEmail ? (
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <AuthFloatingInput
                    label="ایمیل"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="email"
                    autoComplete="email"
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <AuthFloatingInput
                label="ایمیل"
                value={profile.email}
                onChange={() => undefined}
                readOnly
              />
            )}
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
                  fieldClassName="profile-form-field--national-id"
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

          {saveSucceeded ? (
            <AuthAlert variant="success">اطلاعات با موفقیت ذخیره شد.</AuthAlert>
          ) : null}
          {apiError ? <AuthAlert variant="error">{apiError}</AuthAlert> : null}

          <div className="profile-form-actions">
            <AuthSubmitButton
              isEnabled={form.formState.isDirty && form.formState.isValid}
              isPending={isSaving}
              pendingLabel="در حال ذخیره"
            >
              ذخیره تغییرات
            </AuthSubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
