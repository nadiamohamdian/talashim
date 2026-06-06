'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert, Button, Input, Label } from '@sadafgold/ui';
import type { AdminUserDetailView } from '@sadafgold/types';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { updateUserContact } from '@/features/admin/api/admin-api';
import { useAdminPermission } from '@/features/auth/hooks/use-admin-permission';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { userContactSchema, type UserContactFormValues } from '../model/contact-schema';

interface UserContactEditFormProps {
  userId: string;
  data: AdminUserDetailView;
}

function buildDefaults(data: AdminUserDetailView): UserContactFormValues {
  const primary = data.addresses[0];
  return {
    phone: data.kyc?.phone ?? '',
    nationalId: data.kyc?.nationalId ?? '',
    addressId: primary?.id,
    title: primary?.title ?? 'آدرس اصلی',
    recipient: primary?.recipient ?? data.user.fullName,
    addressPhone: primary?.phone ?? data.kyc?.phone ?? '',
    line1: primary?.line1 ?? '',
    city: primary?.city ?? '',
    state: primary?.state ?? '',
    postalCode: primary?.postalCode ?? '',
  };
}

export function UserContactEditForm({ userId, data }: UserContactEditFormProps) {
  const canWrite = useAdminPermission(ADMIN_PERMISSIONS.users.write);
  const queryClient = useQueryClient();

  const form = useForm<UserContactFormValues>({
    resolver: zodResolver(userContactSchema),
    defaultValues: buildDefaults(data),
  });

  useEffect(() => {
    form.reset(buildDefaults(data));
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (values: UserContactFormValues) => {
      const phone = values.phone?.trim() || undefined;
      const nationalId = values.nationalId?.trim() || undefined;

      return updateUserContact(userId, {
        ...(phone ? { phone, ...(nationalId ? { nationalId } : {}) } : {}),
        address: {
          ...(values.addressId ? { id: values.addressId } : {}),
          title: values.title,
          recipient: values.recipient,
          phone: values.addressPhone,
          line1: values.line1,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
        },
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(adminQueryKeys.userDetail(userId), updated);
      form.reset(buildDefaults(updated));
    },
  });

  const needsNationalId = !data.kyc && Boolean(form.watch('phone')?.trim());

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      {mutation.isError ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">
          {getApiErrorMessage(mutation.error, 'ذخیره اطلاعات تماس ناموفق بود')}
        </Alert>
      ) : null}
      {mutation.isSuccess ? (
        <Alert className="border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]">
          اطلاعات تماس و آدرس ذخیره شد.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">موبایل (احراز هویت / OTP)</Label>
          <Input
            id="phone"
            className="mt-2"
            dir="ltr"
            placeholder="09121234567"
            disabled={!canWrite}
            {...form.register('phone')}
          />
          {form.formState.errors.phone ? (
            <p className="mt-1 text-xs text-[var(--error)]">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>
        {needsNationalId ? (
          <div>
            <Label htmlFor="nationalId">کد ملی (برای ثبت KYC)</Label>
            <Input
              id="nationalId"
              className="mt-2"
              dir="ltr"
              disabled={!canWrite}
              {...form.register('nationalId')}
            />
            {form.formState.errors.nationalId ? (
              <p className="mt-1 text-xs text-[var(--error)]">
                {form.formState.errors.nationalId.message}
              </p>
            ) : null}
          </div>
        ) : data.kyc ? (
          <div>
            <Label>کد ملی</Label>
            <p className="mt-2 font-mono text-sm text-[var(--muted-foreground)]" dir="ltr">
              {data.kyc.nationalId}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground">آدرس ارسال</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">عنوان آدرس</Label>
            <Input id="title" className="mt-2" disabled={!canWrite} {...form.register('title')} />
            {form.formState.errors.title ? (
              <p className="mt-1 text-xs text-[var(--error)]">{form.formState.errors.title.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="recipient">نام گیرنده</Label>
            <Input
              id="recipient"
              className="mt-2"
              disabled={!canWrite}
              {...form.register('recipient')}
            />
            {form.formState.errors.recipient ? (
              <p className="mt-1 text-xs text-[var(--error)]">
                {form.formState.errors.recipient.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="addressPhone">موبایل گیرنده</Label>
            <Input
              id="addressPhone"
              className="mt-2"
              dir="ltr"
              disabled={!canWrite}
              {...form.register('addressPhone')}
            />
            {form.formState.errors.addressPhone ? (
              <p className="mt-1 text-xs text-[var(--error)]">
                {form.formState.errors.addressPhone.message}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="line1">آدرس</Label>
            <Input id="line1" className="mt-2" disabled={!canWrite} {...form.register('line1')} />
            {form.formState.errors.line1 ? (
              <p className="mt-1 text-xs text-[var(--error)]">{form.formState.errors.line1.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="city">شهر</Label>
            <Input id="city" className="mt-2" disabled={!canWrite} {...form.register('city')} />
            {form.formState.errors.city ? (
              <p className="mt-1 text-xs text-[var(--error)]">{form.formState.errors.city.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="state">استان</Label>
            <Input id="state" className="mt-2" disabled={!canWrite} {...form.register('state')} />
            {form.formState.errors.state ? (
              <p className="mt-1 text-xs text-[var(--error)]">{form.formState.errors.state.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="postalCode">کد پستی</Label>
            <Input
              id="postalCode"
              className="mt-2"
              dir="ltr"
              disabled={!canWrite}
              {...form.register('postalCode')}
            />
            {form.formState.errors.postalCode ? (
              <p className="mt-1 text-xs text-[var(--error)]">
                {form.formState.errors.postalCode.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {canWrite ? (
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تماس و آدرس'}
        </Button>
      ) : (
        <p className="text-sm text-muted">شما مجوز ویرایش اطلاعات کاربر را ندارید.</p>
      )}
    </form>
  );
}
