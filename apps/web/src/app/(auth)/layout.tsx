import type { PropsWithChildren } from 'react';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: PropsWithChildren) {
  return children;
}
