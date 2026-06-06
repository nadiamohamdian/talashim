'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { Alert } from '@talashim/ui';
import { usePlatformSettingsStore } from '../model/settings-store';

export function SettingsPersistenceNotice() {
  const updatedAt = usePlatformSettingsStore((s) => s.updatedAt);

  return (
    <Alert variant="warning">
      <p className="text-sm leading-6">
        تنظیمات با سرور همگام می‌شوند. حالت تعمیرات پس از ذخیره، روی فروشگاه آنلاین اعمال
        می‌شود.
      </p>
      {updatedAt ? (
        <p className="mt-2 text-xs text-[var(--secondary)]/80">
          آخرین ذخیره:{' '}
          {formatPersianDateTime(updatedAt)}
        </p>
      ) : null}
    </Alert>
  );
}
