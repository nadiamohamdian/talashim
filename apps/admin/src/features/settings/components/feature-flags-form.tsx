'use client';

import { useState } from 'react';
import { patchPlatformSettings } from '../api/settings-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { useSyncSettingsForm } from '../hooks/use-sync-settings-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from '@talashim/ui';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { featureFlagsSchema, type FeatureFlagsSettings } from '../model/schemas';
import { usePlatformSettingsStore } from '../model/settings-store';
import { SettingsFormFooter } from './settings-form-footer';
import { SettingsPersistenceNotice } from './settings-persistence-notice';
import { SettingsSectionCard } from './settings-section-card';
import { SettingsToggleRow } from './settings-toggle-row';

const FLAG_FIELDS: Array<{
  key: keyof FeatureFlagsSettings;
  label: string;
  description: string;
}> = [
  {
    key: 'enableGoldTrading',
    label: 'معاملات طلای آب‌شده',
    description: 'دسترسی کاربران به داشبورد trading.',
  },
  {
    key: 'enableOtpLogin',
    label: 'ورود با OTP',
    description: 'احراز هویت پیامکی برای مشتریان.',
  },
  {
    key: 'enableBlog',
    label: 'وبلاگ و محتوا',
    description: 'نمایش بخش مقالات و FAQ در فروشگاه.',
  },
  {
    key: 'requireKycForTrading',
    label: 'KYC اجباری برای معامله',
    description: 'بدون تأیید هویت، خرید/فروش طلا غیرفعال است.',
  },
  {
    key: 'requireKycForCheckout',
    label: 'KYC اجباری برای خرید',
    description: 'برای تکمیل سفارش فیزیکی نیاز به احراز هویت.',
  },
  {
    key: 'enableGuestCheckout',
    label: 'خرید مهمان',
    description: 'امکان تسویه بدون ثبت‌نام (غیرفعال پیشنهاد می‌شود).',
  },
  {
    key: 'enableWishlist',
    label: 'لیست علاقه‌مندی',
    description: 'ذخیره محصولات برای بازدید بعدی.',
  },
  {
    key: 'enableInventoryReservation',
    label: 'رزرو موجودی هنگام پرداخت',
    description: 'کاهش race condition در سفارش‌های همزمان.',
  },
  {
    key: 'enableAdminAuditExport',
    label: 'خروجی CSV لاگ ممیزی',
    description: 'نمایش دکمه خروجی CSV در صفحه لاگ ممیزی.',
  },
];

export function FeatureFlagsForm() {
  const canWrite = useAdminAuthStore((s) => s.hasPermission(ADMIN_PERMISSIONS.settings.write));
  const featureFlags = usePlatformSettingsStore((s) => s.featureFlags);
  const setFeatureFlags = usePlatformSettingsStore((s) => s.setFeatureFlags);
  const resetSection = usePlatformSettingsStore((s) => s.resetSection);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FeatureFlagsSettings>({
    resolver: zodResolver(featureFlagsSchema),
    defaultValues: featureFlags,
  });

  useSyncSettingsForm(featureFlags, reset);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    setSaveError(null);
    try {
      const savedData = await patchPlatformSettings({ featureFlags: data });
      setFeatureFlags(savedData.featureFlags);
      reset(savedData.featureFlags);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    }
  });

  return (
    <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
      <SettingsPersistenceNotice />
      {saved ? (
        <Alert className="border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]">
          پرچم‌های ویژگی ذخیره شد.
        </Alert>
      ) : null}
      {saveError ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">{saveError}</Alert>
      ) : null}

      <SettingsSectionCard
        title="قابلیت‌های پلتفرم"
        description="تغییرات بدون deploy؛ پس از API به worker و web push می‌شوند."
      >
        {FLAG_FIELDS.map((field) => (
          <SettingsToggleRow
            key={field.key}
            id={field.key}
            label={field.label}
            description={field.description}
            checked={values[field.key]}
            disabled={!canWrite}
            onChange={(checked) => setValue(field.key, checked, { shouldDirty: true })}
          />
        ))}
      </SettingsSectionCard>

      <SettingsFormFooter
        canWrite={canWrite}
        isSubmitting={isSubmitting}
        onReset={() => {
          resetSection('featureFlags');
          reset(usePlatformSettingsStore.getState().featureFlags);
        }}
      />
    </form>
  );
}
