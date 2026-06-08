'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import type { OrderSummary } from '@sadafgold/types';
import { useProfile, useSetInvoiceRecipientMutation } from '@/lib/api';
import { hasInvoiceRecipient } from '../lib/order-invoice';
import { InvoiceRecipientDialog } from './invoice-recipient-dialog';

interface InvoiceAccessLinkProps {
  order: Pick<OrderSummary, 'id' | 'invoiceFirstName' | 'invoiceLastName'>;
  className?: string;
  children: ReactNode;
}

export function InvoiceAccessLink({ order, className, children }: InvoiceAccessLinkProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);
  const setRecipient = useSetInvoiceRecipientMutation();

  if (hasInvoiceRecipient(order)) {
    return (
      <Link href={`/orders/${order.id}/invoice`} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <InvoiceRecipientDialog
          defaultFirstName={profile?.firstName ?? ''}
          defaultLastName={profile?.lastName ?? ''}
          isPending={setRecipient.isPending}
          error={setRecipient.error}
          onClose={() => {
            setOpen(false);
            setRecipient.reset();
          }}
          onSubmit={(values) => {
            setRecipient.mutate(
              { orderId: order.id, ...values },
              {
                onSuccess: () => {
                  setOpen(false);
                  router.push(`/orders/${order.id}/invoice`);
                },
              },
            );
          }}
        />
      ) : null}
    </>
  );
}
