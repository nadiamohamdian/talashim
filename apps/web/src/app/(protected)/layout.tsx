import type { PropsWithChildren } from 'react';

export const metadata = {
  robots: { index: false, follow: false },
};

/** Checkout-only group — auth enforced in checkout/layout.tsx */
export default function ProtectedGroupLayout({ children }: PropsWithChildren) {
  return children;
}
