'use client';

import { useState } from 'react';
import { patchPlatformSettings } from '../api/settings-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { useSyncSettingsForm } from '../hooks/use-sync-settings-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Input, Label } from '@talashim/ui';
import { SettingsTextarea } from './settings-textarea';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { generalSettingsSchema, type GeneralSettings } from '../model/schemas';
import { usePlatformSettingsStore } from '../model/settings-store';
import { SettingsFormFooter } from './settings-form-footer';
import { SettingsPersistenceNotice } from './settings-persistence-notice';
import { SettingsSectionCard } from './settings-section-card';
import { SettingsToggleRow } from './settings-toggle-row';

export function GeneralSettingsForm() {
  const canWrite = useAdminAuthStore((s) => s.hasPermission(ADMIN_PERMISSIONS.settings.write));
  const general = usePlatformSettingsStore((s) => s.general);
  const setGeneral = usePlatformSettingsStore((s) => s.setGeneral);
  const resetSection = usePlatformSettingsStore((s) => s.resetSection);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: general,
  });

  useSyncSettingsForm(general, reset, isDirty);

  const maintenanceMode = watch('maintenanceMode');
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const saveMaintenanceMode = async (checked: boolean) => {
    setSaveError(null);
    setValue('maintenanceMode', checked, { shouldDirty: false });
    setMaintenanceSaving(true);
    try {
      const payload = { ...getValues(), maintenanceMode: checked };
      const data = await patchPlatformSettings({ general: payload });
      setGeneral(data.general);
      reset(data.general);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setValue('maintenanceMode', !checked, { shouldDirty: false });
      setSaveError(getApiErrorMessage(error));
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      const data = await patchPlatformSettings({ general: values });
      setGeneral(data.general);
      reset(data.general);
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
          تنظیمات عمومی ذخیره شد. حالت تعمیرات روی فروشگاه اعمال می‌شود.
        </Alert>
      ) : null}
      {saveError ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">{saveError}</Alert>
      ) : null}

      <SettingsSectionCard
        title="هویت برند"
        description="نام و پیام فروشگاه در سایت و فاکتورها نمایش داده می‌شود."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="storeName">نام فروشگاه</Label>
            <Input id="storeName" className="mt-2" disabled={!canWrite} {...register('storeName')} />
            {errors.storeName ? (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.storeName.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="legalName">نام حقوقی (اختیاری)</Label>
            <Input id="legalName" className="mt-2" disabled={!canWrite} {...register('legalName')} />
          </div>
        </div>
        <div>
          <Label htmlFor="tagline">شعار کوتاه</Label>
          <Input id="tagline" className="mt-2" disabled={!canWrite} {...register('tagline')} />
        </div>
        <div>
          <Label htmlFor="storefrontUrl">آدرس فروشگاه آنلاین</Label>
          <Input
            id="storefrontUrl"
            dir="ltr"
            className="mt-2 text-left"
            disabled={!canWrite}
            {...register('storefrontUrl')}
          />
          {errors.storefrontUrl ? (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.storefrontUrl.message}</p>
          ) : null}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="تماس و حضور" description="اطلاعات پشتیبانی و صفحه تماس با ما.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="supportEmail">ایمیل پشتیبانی</Label>
            <Input
              id="supportEmail"
              type="email"
              dir="ltr"
              className="mt-2 text-left"
              disabled={!canWrite}
              {...register('supportEmail')}
            />
            {errors.supportEmail ? (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.supportEmail.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="supportPhone">تلفن</Label>
            <Input id="supportPhone" className="mt-2" disabled={!canWrite} {...register('supportPhone')} />
          </div>
        </div>
        <div>
          <Label htmlFor="contactAddress">آدرس</Label>
          <SettingsTextarea
            id="contactAddress"
            rows={2}
            className="mt-2"
            disabled={!canWrite}
            {...register('contactAddress')}
          />
        </div>
        <div>
          <Label htmlFor="businessHours">ساعات پاسخ‌گویی</Label>
          <Input id="businessHours" className="mt-2" disabled={!canWrite} {...register('businessHours')} />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="حالت تعمیرات"
        description="با فعال‌سازی، فروشگاه برای مشتریان غیرفعال می‌شود. تغییر این گزینه بلافاصله ذخیره و روی فروشگاه اعمال می‌شود."
      >
        <SettingsToggleRow
          id="maintenanceMode"
          label="فعال‌سازی حالت تعمیرات"
          description={
            maintenanceSaving
              ? 'در حال اعمال روی فروشگاه…'
              : 'فقط سوپر ادمین و پرسنل به پنل دسترسی دارند.'
          }
          checked={maintenanceMode}
          disabled={!canWrite || maintenanceSaving || isSubmitting}
          onChange={(checked) => void saveMaintenanceMode(checked)}
        />
        {maintenanceMode ? (
          <div>
            <Label htmlFor="maintenanceMessage">پیام نمایشی</Label>
            <SettingsTextarea
              id="maintenanceMessage"
              rows={3}
              className="mt-2"
              disabled={!canWrite}
              {...register('maintenanceMessage')}
            />
          </div>
        ) : null}
      </SettingsSectionCard>

      <SettingsFormFooter
        canWrite={canWrite}
        isSubmitting={isSubmitting}
        onReset={() => {
          resetSection('general');
          reset(usePlatformSettingsStore.getState().general);
        }}
      />
    </form>
  );
}
