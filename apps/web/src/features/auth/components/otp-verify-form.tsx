'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import { useOtpVerifyMutation } from '@/features/auth/hooks/use-auth';
import { otpVerifySchema, type OtpVerifyValues } from '@/features/auth/model/schemas';

export function OtpVerifyForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const identifier = searchParams.get('identifier') ?? '';
  const verifyMutation = useOtpVerifyMutation(next);

  const form = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { identifier, code: '' },
  });

  useEffect(() => {
    if (identifier) {
      form.setValue('identifier', identifier);
    }
  }, [identifier, form]);

  const error =
    verifyMutation.error && getApiErrorMessage(verifyMutation.error, 'کد تأیید نامعتبر است');

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => verifyMutation.mutate(values))}
    >
      <div className="space-y-2">
        <Label htmlFor="identifier">موبایل یا ایمیل</Label>
        <Input id="identifier" readOnly {...form.register('identifier')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">کد ۶ رقمی</Label>
        <Input
          id="code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          className="tracking-[0.4em] text-center"
          {...form.register('code')}
        />
        {form.formState.errors.code ? (
          <p className="text-sm text-red-600">{form.formState.errors.code.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
        {verifyMutation.isPending ? 'در حال تأیید...' : 'تأیید و ورود'}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Link href="/login" className="block text-center text-sm text-stone-600 hover:text-stone-950">
        بازگشت به ورود
      </Link>
    </form>
  );
}
