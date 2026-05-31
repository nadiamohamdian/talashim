'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Label } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import { useContactMutation } from '@/lib/api/hooks/use-wishlist';

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^09\d{9}$/),
  message: z.string().min(10),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const mutation = useContactMutation();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', email: '', phone: '', message: '' },
  });

  const error =
    mutation.error && getApiErrorMessage(mutation.error, 'ارسال پیام ناموفق بود');

  return (
    <form
      className="card-luxury mx-auto max-w-lg space-y-4 p-6"
      onSubmit={form.handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: () => {
            form.reset();
          },
        }),
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">نام</Label>
        <Input id="fullName" {...form.register('fullName')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">ایمیل</Label>
        <Input id="email" type="email" {...form.register('email')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">موبایل</Label>
        <Input id="phone" {...form.register('phone')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">پیام</Label>
        <textarea
          id="message"
          className="input-nude min-h-[120px] w-full resize-y px-4 py-3"
          {...form.register('message')}
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'در حال ارسال...' : 'ارسال پیام'}
      </Button>
      {mutation.isSuccess ? (
        <p className="text-sm text-emerald-600">پیام شما ثبت شد. به‌زودی با شما تماس می‌گیریم.</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
