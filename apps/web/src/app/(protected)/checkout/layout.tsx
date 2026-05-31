import type { PropsWithChildren } from 'react';
import { ProtectedShell } from '@/features/auth/components/protected-shell';

export default function CheckoutLayout({ children }: PropsWithChildren) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
