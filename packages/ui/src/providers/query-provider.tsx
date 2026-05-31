'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

export interface QueryProviderOptions {
  staleTime?: number;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
}

export function QueryProvider({
  children,
  staleTime = 60_000,
  retry,
  refetchOnWindowFocus = false,
}: PropsWithChildren<QueryProviderOptions>) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime,
            retry,
            refetchOnWindowFocus,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
