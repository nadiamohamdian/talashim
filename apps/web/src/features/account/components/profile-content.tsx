'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isValidIranMobile, isValidIranNationalId } from '@sadafgold/shared';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import { Badge, Button, Input, Label, Skeleton } from '@sadafgold/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

export function ProfileContent() {
  const { data, isLoading, isError, refetch } = useProfile();
  const mutation = useUpdateProfileMutation();
  const logoutMutation = useLogoutMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: data
      ? {
          firstName: data.firstName ?? splitFullName(data.fullName).firstName,
          lastName: data.lastName ?? splitFullName(data.fullName).lastName,
          nationalId: data.nationalId ?? '',
          phone: data.phone ?? '',
        }
      : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (isError || !data) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری پروفایل ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const error =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'به‌روزرسانی پروفایل ناموفق بود');

  return (
    <div className="space-y-6">
      <div className="card-luxury flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted">خوش آمدید</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{data.fullName}</h2>
          <p className="mt-2 text-xs text-muted">
            عضویت از {formatPersianDate(data.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{getRoleLabelFa(data.role)}</Badge>
          <Badge>
            احراز هویت: {KYC_STATUS_LABELS[data.kycStatus ?? 'none'] ?? data.kycStatus}
          </Badge>
        </div>
      </div>

      <form
        className="card-luxury space-y-6 p-6"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div>
          <h3 className="font-semibold text-foreground">اطلاعات شخصی</h3>
          <p className="mt-1 text-sm text-muted">
            این اطلاعات در فاکتور رسمی و پیگیری سفارش استفاده می‌شود.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">نام</Label>
            <Input id="firstName" {...form.register('firstName')} />
            {form.formState.errors.firstName ? (
              <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">نام خانوادگی</Label>
            <Input id="lastName" {...form.register('lastName')} />
            {form.formState.errors.lastName ? (
              <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nationalId">کد ملی</Label>
            <Input
              id="nationalId"
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              {...form.register('nationalId')}
            />
            {form.formState.errors.nationalId ? (
              <p className="text-sm text-red-600">{form.formState.errors.nationalId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              dir="ltr"
              inputMode="tel"
              maxLength={11}
              placeholder="09121234567"
              {...form.register('phone')}
            />
            {form.formState.errors.phone ? (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>ایمیل</Label>
          <Input value={data.email} disabled dir="ltr" />
          <p className="text-xs text-muted">ایمیل حساب قابل تغییر نیست.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </div>

        {mutation.isSuccess ? (
          <p className="text-sm text-emerald-600">پروفایل با موفقیت به‌روزرسانی شد.</p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <div className="card-luxury flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h3 className="font-semibold text-foreground">خروج از حساب</h3>
          <p className="mt-1 text-sm text-muted">از همه دستگاه‌های فعال خارج می‌شوید.</p>
        </div>
        <Button
          variant="secondary"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? 'در حال خروج...' : 'خروج از حساب'}
        </Button>
      </div>
    </div>
  );
}
