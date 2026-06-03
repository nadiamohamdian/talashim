'use client';

import { useState } from 'react';
import { Button, Skeleton } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import {
  useAddresses,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/features/account/hooks/use-addresses';
import { AddressForm } from '@/features/account/components/address-form';

export function AddressesContent() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, isError, refetch } = useAddresses();
  const createMutation = useCreateAddressMutation();
  const deleteMutation = useDeleteAddressMutation();

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
        <div className="card-luxury p-6 text-sm text-muted">
          هنوز آدرسی ثبت نشده است. برای تحویل سفارش، یک آدرس اضافه کنید.
        </div>
      ) : (
        data.map((address) => (
          <div key={address.id} className="card-luxury flex items-start justify-between gap-4 p-5">
            <div className="text-sm">
              <p className="font-semibold text-stone-950">{address.title}</p>
              <p className="mt-1 text-muted">
                {address.recipient} — {address.phone}
              </p>
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
        <AddressForm
          isPending={createMutation.isPending}
          error={createError || null}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) =>
            createMutation.mutate(values, {
              onSuccess: () => setShowForm(false),
            })
          }
        />
      ) : (
        <Button onClick={() => setShowForm(true)}>افزودن آدرس جدید</Button>
      )}
    </div>
  );
}
