'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';

const StorefrontSettingsContext = createContext<StorefrontSettings | null>(null);

export function StorefrontSettingsProvider({
  value,
  children,
}: PropsWithChildren<{ value: StorefrontSettings }>) {
  return (
    <StorefrontSettingsContext.Provider value={value}>{children}</StorefrontSettingsContext.Provider>
  );
}

export function useStorefrontSettings(): StorefrontSettings {
  const value = useContext(StorefrontSettingsContext);
  if (!value) {
    throw new Error('useStorefrontSettings must be used within StorefrontSettingsProvider');
  }
  return value;
}

export function useFeatureFlag(flag: keyof StorefrontSettings['featureFlags']): boolean {
  return useStorefrontSettings().featureFlags[flag];
}
