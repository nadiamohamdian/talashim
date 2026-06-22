import type { PropsWithChildren } from 'react';

/** Checkout requires auth; payment/confirmation/track also use ProtectedShell. */
export default function CheckoutLayout({ children }: PropsWithChildren) {
  return children;
}
