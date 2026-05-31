'use client';

import { Button } from '@sadafgold/ui';
import { useThemeStore } from '@/shared/model/theme-store';

export function ThemeToggle() {
  const { mode, toggle } = useThemeStore();

  return (
    <Button
      type="button"
      variant="outline"
      className="!rounded-xl px-3 py-2 text-xs"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
    >
      {mode === 'dark' ? '☀️ روشن' : '🌙 تاریک'}
    </Button>
  );
}
