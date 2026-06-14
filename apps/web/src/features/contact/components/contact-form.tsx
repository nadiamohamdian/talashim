'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@/lib/api';
import { useContactMutation } from '@/lib/api/hooks/use-wishlist';
import { CONTACT_PAGE_COPY } from '@/shared/config/contact-page';

const contactSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  subject: z.string().min(2, 'موضوع باید حداقل ۲ کاراکتر باشد').max(200),
  message: z.string().min(10, 'پیام باید حداقل ۱۰ کاراکتر باشد'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const mutation = useContactMutation();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', phone: '', subject: '', message: '' },
  });

  const error =
    mutation.error && getApiErrorMessage(mutation.error, 'ارسال پیام ناموفق بود');

  return (
    <form
      className="contact-form"
      noValidate
      onSubmit={form.handleSubmit((values) =>
        mutation.mutate(
          {
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            subject: values.subject.trim(),
            message: values.message.trim(),
          },
          {
            onSuccess: () => {
              form.reset();
            },
          },
        ),
      )}
    >
      <div className="contact-form-fields">
        <label className="contact-form-field">
          <span className="contact-form-label">نام و نام خانوادگی</span>
          <input
            type="text"
            autoComplete="name"
            className="contact-form-input"
            {...form.register('fullName')}
          />
        </label>

        <label className="contact-form-field">
          <span className="contact-form-label">شماره تماس</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            className="contact-form-input contact-form-input-ltr"
            {...form.register('phone')}
          />
        </label>

        <label className="contact-form-field">
          <span className="contact-form-label">موضوع</span>
          <input type="text" className="contact-form-input" {...form.register('subject')} />
        </label>

        <label className="contact-form-field contact-form-field-message">
          <span className="contact-form-label">پیام</span>
          <textarea
            rows={4}
            className="contact-form-textarea"
            {...form.register('message')}
          />
        </label>
      </div>

      <button type="submit" className="contact-form-submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? CONTACT_PAGE_COPY.submitPendingLabel
          : CONTACT_PAGE_COPY.submitLabel}
      </button>

      {mutation.isSuccess ? (
        <p className="contact-form-feedback contact-form-feedback--success" role="status">
          {CONTACT_PAGE_COPY.successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="contact-form-feedback contact-form-feedback--error" role="alert">
          {error}
        </p>
      ) : null}

      {form.formState.errors.fullName ? (
        <p className="contact-form-field-error">{form.formState.errors.fullName.message}</p>
      ) : null}
      {form.formState.errors.phone ? (
        <p className="contact-form-field-error">{form.formState.errors.phone.message}</p>
      ) : null}
      {form.formState.errors.subject ? (
        <p className="contact-form-field-error">{form.formState.errors.subject.message}</p>
      ) : null}
      {form.formState.errors.message ? (
        <p className="contact-form-field-error">{form.formState.errors.message.message}</p>
      ) : null}
    </form>
  );
}
