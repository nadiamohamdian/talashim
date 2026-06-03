'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IRAN_PROVINCES, getIranCitiesForProvince } from '@sadafgold/shared';
import { Button, Input, Label } from '@sadafgold/ui';
import { FormSelect } from '@/shared/ui/form-select';

const addressSchema = z.object({
  title: z.string().min(2, 'عنوان آدرس را وارد کنید'),
  recipient: z.string().min(2, 'نام گیرنده را وارد کنید'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09121234567)'),
  line1: z.string().min(5, 'آدرس کامل را وارد کنید'),
  state: z.string().min(2, 'استان را انتخاب کنید'),
  city: z.string().min(2, 'شهر را انتخاب کنید'),
  postalCode: z.string().regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  error?: string | null;
  submitLabel?: string;
}

export function AddressForm({
  onSubmit,
  onCancel,
  isPending = false,
  error,
  submitLabel = 'ثبت آدرس',
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: '',
      recipient: '',
      phone: '',
      line1: '',
      state: '',
      city: '',
      postalCode: '',
    },
  });

  const selectedProvince = form.watch('state');
  const cities = selectedProvince ? getIranCitiesForProvince(selectedProvince) : [];

  useEffect(() => {
    const currentCity = form.getValues('city');
    if (currentCity && cities.length && !cities.includes(currentCity)) {
      form.setValue('city', '');
    }
  }, [selectedProvince, cities, form]);

  return (
    <form
      className="card-luxury space-y-6 p-6 sm:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div>
        <h3 className="text-lg font-semibold text-stone-950">آدرس جدید</h3>
        <p className="mt-1 text-sm text-muted">اطلاعات تحویل سفارش را با دقت وارد کنید.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">عنوان آدرس</Label>
          <Input id="title" placeholder="مثلاً: منزل، محل کار" {...form.register('title')} />
          {form.formState.errors.title ? (
            <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">نام گیرنده</Label>
          <Input id="recipient" placeholder="نام و نام خانوادگی" {...form.register('recipient')} />
          {form.formState.errors.recipient ? (
            <p className="text-xs text-red-600">{form.formState.errors.recipient.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">موبایل</Label>
          <Input id="phone" inputMode="tel" placeholder="09121234567" {...form.register('phone')} />
          {form.formState.errors.phone ? (
            <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="line1">آدرس کامل</Label>
          <Input
            id="line1"
            placeholder="خیابان، کوچه، پلاک، واحد"
            {...form.register('line1')}
          />
          {form.formState.errors.line1 ? (
            <p className="text-xs text-red-600">{form.formState.errors.line1.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">استان</Label>
          <FormSelect id="state" {...form.register('state')}>
            <option value="">انتخاب استان</option>
            {IRAN_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </FormSelect>
          {form.formState.errors.state ? (
            <p className="text-xs text-red-600">{form.formState.errors.state.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">شهر</Label>
          <FormSelect id="city" disabled={!selectedProvince} {...form.register('city')}>
            <option value="">انتخاب شهر</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </FormSelect>
          {form.formState.errors.city ? (
            <p className="text-xs text-red-600">{form.formState.errors.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="postalCode">کد پستی</Label>
          <Input id="postalCode" inputMode="numeric" placeholder="1234567890" {...form.register('postalCode')} />
          {form.formState.errors.postalCode ? (
            <p className="text-xs text-red-600">{form.formState.errors.postalCode.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-nude-200 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'در حال ثبت...' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
