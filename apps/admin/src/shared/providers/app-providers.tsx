import type { PropsWithChildren } from 'react';
import { QueryProvider } from '@sadafgold/ui';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider staleTime={10_000} retry={1}>
      {children}
    </QueryProvider>
  );
}
