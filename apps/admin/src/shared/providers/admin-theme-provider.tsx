'use client';

import { useEffect, useRef, type PropsWithChildren } from 'react';
import { resolveThemeIsDark, useAdminUiStore } from '@/shared/model/admin-ui-store';

function applyThemeClass(isDark: boolean, animate: boolean) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 320);
  }
  root.classList.remove('light', 'dark');
  root.classList.add(isDark ? 'dark' : 'light');
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function AdminThemeProvider({ children }: PropsWithChildren) {
  const themeMode = useAdminUiStore((s) => s.themeMode);
  const hasMounted = useRef(false);

  useEffect(() => {
    const isDark = resolveThemeIsDark(themeMode);
    applyThemeClass(isDark, hasMounted.current);
    hasMounted.current = true;

    if (themeMode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass(mq.matches, true);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeMode]);

  return children;
}
