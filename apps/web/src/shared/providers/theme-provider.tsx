'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useThemeStore } from '@/shared/model/theme-store';

export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return <>{children}</>;
}
