'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Label, Skeleton } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import {
  useAddresses,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/features/account/hooks/use-addresses';

const addressSchema = z.object({
  title: z.string().min(2),
  recipient: z.string().min(2),
  phone: z.string().regex(/^09\d{9}$/),
  line1: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(5),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressesContent() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, isError, refetch } = useAddresses();
  const createMutation = useCreateAddressMutation();
  const deleteMutation = useDeleteAddressMutation();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: '',
      recipient: '',
      phone: '',
      line1: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری آدرس‌ها ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const createError =
    createMutation.error &&
    getApiErrorMessage(createMutation.error, 'ثبت آدرس ناموفق بود');

  return (
    <div className="space-y-4">
      {!data?.length ? (
        <div className="card-luxury p-6 text-sm text-muted">هنوز آدرسی ثبت نشده است.</div>
      ) : (
        data.map((address) => (
          <div key={address.id} className="card-luxury flex items-start justify-between p-5">
            <div className="text-sm">
              <p className="font-semibold">{address.title}</p>
              <p className="mt-1 text-muted">{address.recipient} — {address.phone}</p>
              <p className="mt-1">{address.line1}</p>
              <p className="text-muted">
                {address.city}، {address.state} — {address.postalCode}
              </p>
            </div>
            <Button
              variant="outline"
              className="!px-3 !py-1.5 text-xs"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(address.id)}
            >
              حذف
            </Button>
          </div>
        ))
      )}

      {showForm ? (
        <form
          className="card-luxury grid gap-4 p-6 sm:grid-cols-2"
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate(values, {
              onSuccess: () => {
                form.reset();
                setShowForm(false);
              },
            }),
          )}
        >
          {(['title', 'recipient', 'phone', 'line1', 'city', 'state', 'postalCode'] as const).map(
            (field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{field}</Label>
                <Input id={field} {...form.register(field)} />
              </div>
            ),
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'در حال ثبت...' : 'ثبت آدرس'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              انصراف
            </Button>
          </div>
          {createError ? <p className="text-sm text-red-600 sm:col-span-2">{createError}</p> : null}
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)}>افزودن آدرس جدید</Button>
      )}
    </div>
  );
}
