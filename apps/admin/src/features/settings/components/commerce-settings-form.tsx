'use client';

import { useState } from 'react';
import { patchPlatformSettings } from '../api/settings-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { useSyncSettingsForm } from '../hooks/use-sync-settings-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { Alert, Input, Label } from '@talashim/ui';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { commerceSettingsSchema, type CommerceSettings } from '../model/schemas';
import { usePlatformSettingsStore } from '../model/settings-store';
import { SettingsFormFooter } from './settings-form-footer';
import { SettingsPersistenceNotice } from './settings-persistence-notice';
import { SettingsSectionCard } from './settings-section-card';
import { SettingsToggleRow } from './settings-toggle-row';

export function CommerceSettingsForm() {
  const canWrite = useAdminAuthStore((s) => s.hasPermission(ADMIN_PERMISSIONS.settings.write));
  const commerce = usePlatformSettingsStore((s) => s.commerce);
  const setCommerce = usePlatformSettingsStore((s) => s.setCommerce);
  const resetSection = usePlatformSettingsStore((s) => s.resetSection);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommerceSettings>({
    resolver: zodResolver(commerceSettingsSchema) as Resolver<CommerceSettings>,
    defaultValues: commerce,
  });

  useSyncSettingsForm(commerce, reset);

  const flags = {
    online: watch('enableOnlinePayment'),
    wallet: watch('enableWalletCheckout'),
    cod: watch('enableCod'),
    autoConfirm: watch('autoConfirmPaidOrders'),
  };

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      const data = await patchPlatformSettings({ commerce: values });
      setCommerce(data.commerce);
      reset(data.commerce);
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
          تنظیمات تجارت ذخیره شد.
        </Alert>
      ) : null}
      {saveError ? (
        <Alert className="border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">{saveError}</Alert>
      ) : null}

      <SettingsSectionCard title="سفارش و سبد" description="قوانین حداقل خرید و انقضای سبد.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="currencyLabel">واحد پول نمایشی</Label>
            <Input
              id="currencyLabel"
              className="mt-2"
              disabled={!canWrite}
              {...register('currencyLabel')}
            />
          </div>
          <div>
            <Label htmlFor="orderNumberPrefix">پیشوند شماره سفارش</Label>
            <Input
              id="orderNumberPrefix"
              dir="ltr"
              className="mt-2 text-left uppercase"
              disabled={!canWrite}
              {...register('orderNumberPrefix')}
            />
          </div>
          <div>
            <Label htmlFor="minOrderToman">حداقل مبلغ سفارش (تومان)</Label>
            <Input
              id="minOrderToman"
              type="number"
              min={0}
              className="mt-2"
              disabled={!canWrite}
              {...register('minOrderToman')}
            />
          </div>
          <div>
            <Label htmlFor="freeShippingMinToman">آستانه ارسال رایگان (تومان)</Label>
            <Input
              id="freeShippingMinToman"
              type="number"
              min={0}
              className="mt-2"
              disabled={!canWrite}
              {...register('freeShippingMinToman')}
            />
          </div>
          <div>
            <Label htmlFor="cartTtlHours">انقضای سبد (ساعت)</Label>
            <Input
              id="cartTtlHours"
              type="number"
              min={1}
              className="mt-2"
              disabled={!canWrite}
              {...register('cartTtlHours')}
            />
          </div>
          <div>
            <Label htmlFor="defaultTaxPercent">مالیات پیش‌فرض (%)</Label>
            <Input
              id="defaultTaxPercent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              className="mt-2"
              disabled={!canWrite}
              {...register('defaultTaxPercent')}
            />
            {errors.defaultTaxPercent ? (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.defaultTaxPercent.message}</p>
            ) : null}
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="روش‌های پرداخت" description="فعال‌سازی درگاه‌ها برای فروشگاه.">
        <SettingsToggleRow
          id="enableOnlinePayment"
          label="پرداخت آنلاین"
          checked={flags.online}
          disabled={!canWrite}
          onChange={(v) => setValue('enableOnlinePayment', v, { shouldDirty: true })}
        />
        <SettingsToggleRow
          id="enableWalletCheckout"
          label="پرداخت از کیف پول"
          description="استفاده از موجودی تومانی/طلایی کاربر در تسویه."
          checked={flags.wallet}
          disabled={!canWrite}
          onChange={(v) => setValue('enableWalletCheckout', v, { shouldDirty: true })}
        />
        <SettingsToggleRow
          id="enableCod"
          label="پرداخت در محل (COD)"
          checked={flags.cod}
          disabled={!canWrite}
          onChange={(v) => setValue('enableCod', v, { shouldDirty: true })}
        />
        <SettingsToggleRow
          id="autoConfirmPaidOrders"
          label="تأیید خودکار سفارش پرداخت‌شده"
          description="پس از موفقیت پرداخت، وضعیت به «تأیید‌شده» می‌رود."
          checked={flags.autoConfirm}
          disabled={!canWrite}
          onChange={(v) => setValue('autoConfirmPaidOrders', v, { shouldDirty: true })}
        />
      </SettingsSectionCard>

      <SettingsFormFooter
        canWrite={canWrite}
        isSubmitting={isSubmitting}
        onReset={() => {
          resetSection('commerce');
          reset(usePlatformSettingsStore.getState().commerce);
        }}
      />
    </form>
  );
}
