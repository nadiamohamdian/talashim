'use client';

import { useEffect } from 'react';
import { fetchPlatformSettings } from '../api/settings-api';
import { usePlatformSettingsStore } from '../model/settings-store';

export function usePlatformSettingsLoader(): void {
  useEffect(() => {
    let cancelled = false;

    void fetchPlatformSettings()
      .then((data) => {
        if (cancelled) {
          return;
        }
        usePlatformSettingsStore.setState({
          general: data.general,
          commerce: data.commerce,
          gold: data.gold,
          featureFlags: data.featureFlags,
          updatedAt: data.updatedAt,
        });
      })
      .catch(() => {
        // Keep local defaults when API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);
}
