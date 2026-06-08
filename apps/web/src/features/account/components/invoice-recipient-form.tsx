'use client';

import { useState } from 'react';
import { Alert, Button, Input, Label } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';

interface InvoiceRecipientFormProps {
  defaultFirstName?: string;
  defaultLastName?: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (values: { firstName: string; lastName: string }) => void;
  submitLabel?: string;
}

export function InvoiceRecipientForm({
  defaultFirstName = '',
  defaultLastName = '',
  isPending,
  error,
  onSubmit,
  submitLabel = 'صدور فاکتور',
}: InvoiceRecipientFormProps) {
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (trimmedFirstName.length < 2 || trimmedLastName.length < 2) {
          setValidationError('نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد.');
          return;
        }

        setValidationError(null);
        onSubmit({ firstName: trimmedFirstName, lastName: trimmedLastName });
      }}
    >
      <p className="text-sm text-muted">
        لطفاً مشخص کنید فاکتور به نام چه کسی صادر شود.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="invoice-first-name">نام</Label>
          <Input
            id="invoice-first-name"
            className="mt-2"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="نام"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label htmlFor="invoice-last-name">نام خانوادگی</Label>
          <Input
            id="invoice-last-name"
            className="mt-2"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="نام خانوادگی"
            autoComplete="family-name"
          />
        </div>
      </div>

      {validationError ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">
          {validationError}
        </Alert>
      ) : null}
      {error ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">
          {getApiErrorMessage(error, 'ثبت نام صادرکننده فاکتور ناموفق بود.')}
        </Alert>
      ) : null}

      <Button type="submit" disabled={!canSubmit || isPending}>
        {isPending ? 'در حال ثبت…' : submitLabel}
      </Button>
    </form>
  );
}
