'use client';

import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import type { PublicCmsBanner } from '@sadafgold/types';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';
import { ClientRoot } from '@/shared/providers/client-root';
import { MaintenancePage } from './maintenance-page';

const POLL_MS = 10_000;

type MaintenanceShellProps = PropsWithChildren<{
  initialSettings: StorefrontSettings;
  globalBanners?: PublicCmsBanner[];
}>;

export function MaintenanceShell({
  initialSettings,
  globalBanners = [],
  children,
}: MaintenanceShellProps) {
  const [settings, setSettings] = useState(initialSettings);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/site/status', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const status = (await response.json()) as Pick<
        StorefrontSettings,
        'maintenanceMode' | 'maintenanceMessage' | 'updatedAt'
      >;

      setSettings((current) => {
        const maintenanceChanged = current.maintenanceMode !== status.maintenanceMode;
        if (!maintenanceChanged) {
          return {
            ...current,
            maintenanceMessage: status.maintenanceMessage,
            updatedAt: status.updatedAt,
          };
        }

        return {
          ...current,
          maintenanceMode: status.maintenanceMode,
          maintenanceMessage: status.maintenanceMessage,
          updatedAt: status.updatedAt,
        };
      });

      if (!status.maintenanceMode) {
        const configResponse = await fetch('/api/site/config', { cache: 'no-store' });
        if (configResponse.ok) {
          const config = (await configResponse.json()) as StorefrontSettings;
          setSettings(config);
        }
      }
    } catch {
      // Keep last known settings when the status probe fails.
    }
  }, []);

  useEffect(() => {
    void refreshStatus();

    const intervalId = window.setInterval(() => {
      void refreshStatus();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshStatus();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [refreshStatus]);

  if (settings.maintenanceMode) {
    return (
      <MaintenancePage
        storeName={settings.general.storeName}
        message={settings.maintenanceMessage}
      />
    );
  }

  return (
    <ClientRoot settings={settings} globalBanners={globalBanners}>
      {children}
    </ClientRoot>
  );
}
