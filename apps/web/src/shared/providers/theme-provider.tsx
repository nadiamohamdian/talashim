'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useThemeStore } from '@/shared/model/theme-store';

export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = mode === 'dark';
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [mode]);

  return <>{children}</>;
}
