import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

/** Guest-accessible marketing, catalog, and content routes. */
export default function PublicLayout({ children }: PropsWithChildren) {
  return children;
}
