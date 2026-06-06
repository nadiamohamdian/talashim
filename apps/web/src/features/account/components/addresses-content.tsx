'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, Skeleton } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import {
  useAddresses,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/features/account/hooks/use-addresses';
import { AddressForm } from '@/features/account/components/address-form';

function normalizeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  return value;
}

export function AddressesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = normalizeReturnTo(searchParams.get('returnTo'));
  const [showForm, setShowForm] = useState(false);
  const [addressJustSaved, setAddressJustSaved] = useState(false);
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

  const canReturnToCheckout = Boolean(returnTo && data?.length);
  const showReturnPrompt = canReturnToCheckout && (addressJustSaved || !showForm);

  return (
    <div className="space-y-4">
      {showReturnPrompt ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-stone-800">
            {addressJustSaved
              ? 'آدرس با موفقیت ثبت شد. می‌توانید به فرایند ثبت سفارش برگردید.'
              : 'برای ادامه خرید و ثبت سفارش به صفحه پرداخت برگردید.'}
          </p>
          <Button type="button" className="mt-3" onClick={() => router.push(returnTo!)}>
            ادامه ثبت سفارش
          </Button>
        </div>
      ) : null}
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
              onSuccess: () => {
                setShowForm(false);
                setAddressJustSaved(true);
              },
            })
          }
        />
      ) : (
        <Button onClick={() => setShowForm(true)}>افزودن آدرس جدید</Button>
      )}
    </div>
  );
}
