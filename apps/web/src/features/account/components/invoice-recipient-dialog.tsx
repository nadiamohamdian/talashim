'use client';

import { InvoiceRecipientForm } from './invoice-recipient-form';

interface InvoiceRecipientDialogProps {
  defaultFirstName?: string;
  defaultLastName?: string;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: { firstName: string; lastName: string }) => void;
}

export function InvoiceRecipientDialog({
  defaultFirstName,
  defaultLastName,
  isPending,
  error,
  onClose,
  onSubmit,
}: InvoiceRecipientDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/40"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-t-3xl border border-nude-200 bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <h2 className="text-lg font-bold text-foreground">صدور فاکتور</h2>
        <p className="mt-1 text-sm text-muted">نام و نام خانوادگی صادرکننده فاکتور را وارد کنید.</p>

        <div className="mt-5">
          <InvoiceRecipientForm
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            isPending={isPending}
            error={error}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
