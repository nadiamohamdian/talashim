'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarMode = 'expanded' | 'mini' | 'collapsed';

interface AdminUiState {
  themeMode: ThemeMode;
  sidebarMode: SidebarMode;
  sidebarPinned: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  cycleThemeMode: () => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebarCollapsed: () => void;
  toggleSidebarMini: () => void;
  toggleSidebarPinned: () => void;
}

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      sidebarMode: 'expanded',
      sidebarPinned: true,

      setThemeMode: (mode) => set({ themeMode: mode }),

      cycleThemeMode: () => {
        const current = get().themeMode;
        const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
        set({ themeMode: next });
      },

      setSidebarMode: (mode) => set({ sidebarMode: mode }),

      toggleSidebarCollapsed: () => {
        const { sidebarMode } = get();
        set({ sidebarMode: sidebarMode === 'collapsed' ? 'expanded' : 'collapsed' });
      },

      toggleSidebarMini: () => {
        const { sidebarMode } = get();
        set({ sidebarMode: sidebarMode === 'mini' ? 'expanded' : 'mini' });
      },

      toggleSidebarPinned: () => set((s) => ({ sidebarPinned: !s.sidebarPinned })),
    }),
    { name: 'admin-ui-store' },
  ),
);

export function resolveThemeIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
