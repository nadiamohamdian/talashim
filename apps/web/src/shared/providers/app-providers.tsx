'use client';

import type { PropsWithChildren } from "react";
import { QueryProvider } from '@sadafgold/ui/providers/query-provider';
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}
