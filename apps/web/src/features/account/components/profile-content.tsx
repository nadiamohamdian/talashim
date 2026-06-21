'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isValidIranMobile, isValidIranNationalId } from '@sadafgold/shared';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import { Skeleton } from '@sadafgold/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthFloatingInput } from '@/features/auth/components/auth-floating-input';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';
import { useProfile, useUpdateProfileMutation } from '@/features/account/hooks/use-profile';
import { formatPersianDate } from '@/shared/lib/persian-date';

const profileSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
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

const KYC_STATUS_LABELS: Record<string, string> = {
  none: 'ثبت نشده',
  pending: 'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

function kycBadgeClass(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return 'profile-badge profile-badge--approved';
    case 'pending':
      return 'profile-badge profile-badge--pending';
    case 'rejected':
      return 'profile-badge profile-badge--rejected';
    default:
      return 'profile-badge';
  }
}

export function ProfileContent() {
  const { data, isLoading, isError, refetch } = useProfile();
  const mutation = useUpdateProfileMutation();
  const logoutMutation = useLogoutMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nationalId: '',
      phone: '',
    },
    values: data
      ? {
          firstName: data.firstName ?? splitFullName(data.fullName).firstName,
          lastName: data.lastName ?? splitFullName(data.fullName).lastName,
          nationalId: data.nationalId ?? '',
          phone: data.phone ?? '',
        }
      : undefined,
    mode: 'onChange',
  });

  if (isLoading) {
    return (
      <div className="profile-page-content">
        <Skeleton className="profile-skeleton profile-skeleton--hero" />
        <Skeleton className="profile-skeleton profile-skeleton--form" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="profile-page-content">
        <div className="profile-error-card">
          <p>بارگذاری پروفایل ناموفق بود.</p>
          <button type="button" className="profile-error-retry" onClick={() => refetch()}>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const error =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'به‌روزرسانی پروفایل ناموفق بود');

  const kycStatus = data.kycStatus ?? 'none';

  return (
    <div className="profile-page-content">
      <section className="profile-hero" aria-label="خلاصه حساب">
        <div className="profile-hero-copy">
          <p className="profile-hero-eyebrow">خوش آمدید</p>
          <h2 className="profile-hero-name">{data.fullName}</h2>
          <p className="profile-hero-meta">عضویت از {formatPersianDate(data.createdAt)}</p>
        </div>
        <div className="profile-badges">
          <span className="profile-badge">{getRoleLabelFa(data.role)}</span>
          <span className={kycBadgeClass(kycStatus)}>
            احراز هویت: {KYC_STATUS_LABELS[kycStatus] ?? kycStatus}
          </span>
        </div>
      </section>

      <form
        className="profile-form"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <header className="profile-form-header">
          <h3 className="profile-form-title">اطلاعات شخصی</h3>
          <p className="profile-form-lead">
            این اطلاعات در فاکتور رسمی و پیگیری سفارش استفاده می‌شود.
          </p>
        </header>

        <div className="profile-form-grid">
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="profile-firstName"
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
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="profile-lastName"
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
            control={form.control}
            name="nationalId"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="profile-nationalId"
                label="کد ملی"
                value={field.value}
                onChange={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 10))}
                onBlur={field.onBlur}
                inputMode="numeric"
                numeric
                maxLength={10}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <AuthFloatingInput
                id="profile-phone"
                label="شماره موبایل"
                type="tel"
                inputMode="tel"
                value={field.value}
                onChange={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 11))}
                onBlur={field.onBlur}
                autoComplete="tel"
                numeric
                maxLength={11}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="profile-form-grid profile-form-grid--single">
          <AuthFloatingInput
            id="profile-email"
            label="ایمیل"
            type="email"
            value={data.email ?? ''}
            onChange={() => undefined}
            readOnly
          />
          <p className="profile-field-note">ایمیل حساب قابل تغییر نیست.</p>
        </div>

        <div className="profile-form-actions">
          <AuthSubmitButton
            isEnabled={form.formState.isValid}
            isPending={mutation.isPending}
            pendingLabel="در حال ذخیره"
          >
            ذخیره تغییرات
          </AuthSubmitButton>
        </div>

        {mutation.isSuccess ? (
          <AuthAlert variant="success">پروفایل با موفقیت به‌روزرسانی شد.</AuthAlert>
        ) : null}
        {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
      </form>

      <section className="profile-logout-card">
        <div className="profile-logout-copy">
          <h3 className="profile-logout-title">خروج از حساب</h3>
          <p className="profile-logout-lead">از همه دستگاه‌های فعال خارج می‌شوید.</p>
        </div>
        <button
          type="button"
          className="profile-logout-button"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? 'در حال خروج...' : 'خروج از حساب'}
        </button>
      </section>
    </div>
  );
}
