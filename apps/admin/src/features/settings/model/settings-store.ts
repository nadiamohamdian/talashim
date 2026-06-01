'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  commerceSettingsSchema,
  featureFlagsSchema,
  generalSettingsSchema,
  goldSettingsSchema,
  type CommerceSettings,
  type FeatureFlagsSettings,
  type GeneralSettings,
  type GoldSettings,
  type PlatformSettings,
} from './schemas';
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_GOLD_SETTINGS,
} from './defaults';

const STORAGE_KEY = 'talashim-platform-settings-v1';

interface SettingsState extends PlatformSettings {
  setGeneral: (values: GeneralSettings) => void;
  setCommerce: (values: CommerceSettings) => void;
  setGold: (values: GoldSettings) => void;
  setFeatureFlags: (values: FeatureFlagsSettings) => void;
  resetSection: (section: keyof Omit<PlatformSettings, 'updatedAt'>) => void;
  resetAll: () => void;
}

function touchUpdatedAt(): string {
  return new Date().toISOString();
}

export const usePlatformSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      general: DEFAULT_GENERAL_SETTINGS,
      commerce: DEFAULT_COMMERCE_SETTINGS,
      gold: DEFAULT_GOLD_SETTINGS,
      featureFlags: DEFAULT_FEATURE_FLAGS,
      updatedAt: null,
      setGeneral: (values) => {
        const general = generalSettingsSchema.parse(values);
        set({ general, updatedAt: touchUpdatedAt() });
      },
      setCommerce: (values) => {
        const commerce = commerceSettingsSchema.parse(values);
        set({ commerce, updatedAt: touchUpdatedAt() });
      },
      setGold: (values) => {
        const gold = goldSettingsSchema.parse(values);
        set({ gold, updatedAt: touchUpdatedAt() });
      },
      setFeatureFlags: (values) => {
        const featureFlags = featureFlagsSchema.parse(values);
        set({ featureFlags, updatedAt: touchUpdatedAt() });
      },
      resetSection: (section) => {
        switch (section) {
          case 'general':
            set({ general: DEFAULT_GENERAL_SETTINGS, updatedAt: touchUpdatedAt() });
            break;
          case 'commerce':
            set({ commerce: DEFAULT_COMMERCE_SETTINGS, updatedAt: touchUpdatedAt() });
            break;
          case 'gold':
            set({ gold: DEFAULT_GOLD_SETTINGS, updatedAt: touchUpdatedAt() });
            break;
          case 'featureFlags':
            set({ featureFlags: DEFAULT_FEATURE_FLAGS, updatedAt: touchUpdatedAt() });
            break;
          default:
            break;
        }
      },
      resetAll: () =>
        set({
          general: DEFAULT_GENERAL_SETTINGS,
          commerce: DEFAULT_COMMERCE_SETTINGS,
          gold: DEFAULT_GOLD_SETTINGS,
          featureFlags: DEFAULT_FEATURE_FLAGS,
          updatedAt: touchUpdatedAt(),
        }),
    }),
    { name: STORAGE_KEY },
  ),
);
