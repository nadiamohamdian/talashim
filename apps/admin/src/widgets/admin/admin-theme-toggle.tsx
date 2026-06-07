'use client';

import { Monitor, Moon, Sun } from '@/shared/ui/icons';
import { useAdminUiStore, type ThemeMode } from '@/shared/model/admin-ui-store';

const LABELS: Record<ThemeMode, string> = {
  light: 'حالت روشن',
  dark: 'حالت تاریک',
  system: 'هماهنگ با سیستم',
};

export function AdminThemeToggle() {
  const themeMode = useAdminUiStore((s) => s.themeMode);
  const cycleThemeMode = useAdminUiStore((s) => s.cycleThemeMode);

  const Icon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Monitor;

  return (
    <button
      type="button"
      className="admin-icon-btn admin-theme-toggle"
      onClick={cycleThemeMode}
      aria-label={LABELS[themeMode]}
      title={LABELS[themeMode]}
    >
      <Icon className="size-4 transition-transform duration-300" strokeWidth={1.5} />
    </button>
  );
}
