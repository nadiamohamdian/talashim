'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge, Button, Input, Label, Skeleton } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import { useKycStatus, useSubmitKycMutation } from '@/features/account/hooks/use-kyc';

const kycSchema = z.object({
  nationalId: z.string().regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  documentUrl: z.string().url('آدرس سند معتبر نیست').optional().or(z.literal('')),
});

type KycFormValues = z.infer<typeof kycSchema>;

export function KycContent() {
  const { data, isLoading, isError, refetch } = useKycStatus();
  const mutation = useSubmitKycMutation();

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: { nationalId: '', phone: '', documentUrl: '' },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری وضعیت KYC ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (data && 'status' in data && data.status !== 'none') {
    const status = data.status;
    return (
      <div className="card-luxury space-y-4 p-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">وضعیت:</span>
          <Badge>{status}</Badge>
        </div>
        {'nationalId' in data ? (
          <>
            <p className="text-sm">کد ملی: {data.nationalId}</p>
            <p className="text-sm">موبایل: {data.phone}</p>
            {data.reviewNote ? (
              <p className="text-sm text-muted">یادداشت بررسی: {data.reviewNote}</p>
            ) : null}
          </>
        ) : null}
        {status === 'rejected' ? (
          <p className="text-sm text-amber-700">می‌توانید مجدداً درخواست ارسال کنید.</p>
        ) : null}
      </div>
    );
  }

  const error =
    mutation.error &&
    getApiErrorMessage(mutation.error, 'ارسال درخواست KYC ناموفق بود');

  return (
    <form
      className="card-luxury space-y-4 p-6"
      onSubmit={form.handleSubmit((values) =>
        mutation.mutate({
          nationalId: values.nationalId,
          phone: values.phone,
          documentUrl: values.documentUrl || undefined,
        }),
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="nationalId">کد ملی</Label>
        <Input id="nationalId" {...form.register('nationalId')} />
        {form.formState.errors.nationalId ? (
          <p className="text-sm text-red-600">{form.formState.errors.nationalId.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">شماره موبایل</Label>
        <Input id="phone" {...form.register('phone')} />
        {form.formState.errors.phone ? (
          <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="documentUrl">آدرس سند (اختیاری)</Label>
        <Input id="documentUrl" {...form.register('documentUrl')} />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'در حال ارسال...' : 'ارسال درخواست احراز هویت'}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
