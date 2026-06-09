import type { PropsWithChildren } from 'react';

/** Shipping step is public; payment/confirmation/track wrap themselves in ProtectedShell. */
export default function CheckoutLayout({ children }: PropsWithChildren) {
  return children;
}
