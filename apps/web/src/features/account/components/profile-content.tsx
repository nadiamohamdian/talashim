'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Label, Skeleton } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import { useProfile, useUpdateProfileMutation } from '@/features/account/hooks/use-profile';

const profileSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileContent() {
  const { data, isLoading, isError, refetch } = useProfile();
  const mutation = useUpdateProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: data ? { fullName: data.fullName } : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
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
    <form
      className="card-luxury space-y-4 p-6"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="space-y-2">
        <Label>ایمیل</Label>
        <Input value={data.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">نام کامل</Label>
        <Input id="fullName" {...form.register('fullName')} />
        {form.formState.errors.fullName ? (
          <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </Button>
      {mutation.isSuccess ? (
        <p className="text-sm text-emerald-600">پروفایل با موفقیت به‌روزرسانی شد.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
