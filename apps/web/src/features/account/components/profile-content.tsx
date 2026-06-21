'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isValidIranMobile } from '@sadafgold/shared';
import { Skeleton } from '@sadafgold/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthAlert } from '@/features/auth/components/auth-alert';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { ProfileOutlinedInput } from '@/features/account/components/profile-outlined-input';
import { useAddresses } from '@/features/account/hooks/use-addresses';
import { resolveProfileDisplayName, resolveProfilePhone } from '@/features/account/lib/profile-display';
import { getApiErrorMessage } from '@/lib/api';
import { useProfile, useUpdateProfileMutation } from '@/features/account/hooks/use-profile';

const profileSchema = z.object({
  fullName: z.string().min(2, 'نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد')
    .refine(isValidIranMobile, 'شماره موبایل معتبر نیست'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: trimmed };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

function formatAddressLine(
  addresses: Array<{ line1: string; city: string }> | undefined,
): string {
  if (!addresses?.length) {
    return '';
  }

  const address = addresses[0];
  return [address.line1, address.city].filter(Boolean).join('، ');
}

export function ProfileContent() {
  const { data, isLoading, isError, refetch } = useProfile();
  const { data: addresses } = useAddresses();
  const mutation = useUpdateProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    },
    values: data
      ? {
          fullName: resolveProfileDisplayName(data),
          phone: resolveProfilePhone(data) ?? '',
        }
      : undefined,
    mode: 'onChange',
  });

  if (isLoading) {
    return (
      <div className="profile-figma-content">
        <Skeleton className="profile-skeleton profile-skeleton--figma-form" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="profile-figma-content">
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

  const emailValue = data.email ?? '';
  const addressValue = formatAddressLine(addresses);

  return (
    <div className="profile-figma-content">
      <form
        className="profile-figma-form"
        onSubmit={form.handleSubmit((values) => {
          const { firstName, lastName } = splitFullName(values.fullName);
          mutation.mutate({
            firstName,
            lastName,
            phone: values.phone,
            ...(data.nationalId ? { nationalId: data.nationalId } : {}),
          });
        })}
      >
        <div className="profile-figma-grid">
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <ProfileOutlinedInput
                id="profile-fullName"
                placeholder="نام و نام خانوادگی کاربر"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                autoComplete="name"
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <ProfileOutlinedInput
                id="profile-phone"
                placeholder="تلفن همراه"
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
          <ProfileOutlinedInput
            id="profile-email"
            placeholder="ایمیل (اختیاری)"
            type="email"
            inputMode="email"
            value={emailValue}
            readOnly
          />
          <ProfileOutlinedInput
            id="profile-address"
            placeholder="آدرس"
            value={addressValue}
            readOnly
          />
        </div>

        <div className="profile-figma-actions">
          <AuthSubmitButton
            isEnabled={form.formState.isValid}
            isPending={mutation.isPending}
            pendingLabel="در حال ذخیره"
          >
            ویرایش اطلاعات
          </AuthSubmitButton>
        </div>

        {mutation.isSuccess ? (
          <AuthAlert variant="success">پروفایل با موفقیت به‌روزرسانی شد.</AuthAlert>
        ) : null}
        {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
      </form>
    </div>
  );
}
