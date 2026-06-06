'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { Alert } from '@talashim/ui';
import { usePlatformSettingsStore } from '../model/settings-store';

export function SettingsPersistenceNotice() {
  const updatedAt = usePlatformSettingsStore((s) => s.updatedAt);

  return (
    <Alert className="border-amber-200/80 bg-amber-50/90 text-amber-950">
      <p className="text-sm leading-6">
        تنظیمات فعلاً در مرورگر شما ذخیره می‌شوند (تا اتصال API مدیریت تنظیمات). پس از
        پیاده‌سازی{' '}
        <code className="rounded bg-white/80 px-1 text-xs" dir="ltr">
          GET/PATCH /admin/settings
        </code>{' '}
        همین فرم‌ها با سرور همگام می‌شوند.
      </p>
      {updatedAt ? (
        <p className="mt-2 text-xs text-amber-900/80">
          آخرین ذخیره:{' '}
          {formatPersianDateTime(updatedAt)}
        </p>
      ) : null}
    </Alert>
  );
}
