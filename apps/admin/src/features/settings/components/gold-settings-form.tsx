'use client';

import { useState } from 'react';
import { useSyncSettingsForm } from '../hooks/use-sync-settings-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Input, Label } from '@sadafgold/ui';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { goldSettingsSchema, type GoldSettings } from '../model/schemas';
import { usePlatformSettingsStore } from '../model/settings-store';
import { SettingsFormFooter } from './settings-form-footer';
import { SettingsPersistenceNotice } from './settings-persistence-notice';
import { SettingsSectionCard } from './settings-section-card';
import { SettingsToggleRow } from './settings-toggle-row';

export function GoldSettingsForm() {
  const canWrite = useAdminAuthStore((s) => s.hasPermission(ADMIN_PERMISSIONS.settings.write));
  const gold = usePlatformSettingsStore((s) => s.gold);
  const setGold = usePlatformSettingsStore((s) => s.setGold);
  const resetSection = usePlatformSettingsStore((s) => s.resetSection);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoldSettings>({
    resolver: zodResolver(goldSettingsSchema),
    defaultValues: gold,
  });

  useSyncSettingsForm(gold, reset);

  const livePricing = watch('useLivePricingForProducts');
  const ticker = watch('showGoldTickerInHeader');

  const onSubmit = handleSubmit((values) => {
    setGold(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  });

  return (
    <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
      <SettingsPersistenceNotice />
      {saved ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          تنظیمات طلا ذخیره شد.
        </Alert>
      ) : null}

      <SettingsSectionCard
        title="قیمت‌گذاری محصولات"
        description="هم‌راستا با فرمول jewelry-pricing و نرخ لحظه‌ای بازار."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="displayKarat">عیار نمایش پیش‌فرض</Label>
            <select
              id="displayKarat"
              className="mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm disabled:opacity-50"
              disabled={!canWrite}
              {...register('displayKarat')}
            >
              <option value={18}>۱۸ عیار</option>
              <option value={24}>۲۴ عیار</option>
            </select>
          </div>
          <div>
            <Label htmlFor="defaultMakingFeePercent">اجرت پیش‌فرض محصولات (%)</Label>
            <Input
              id="defaultMakingFeePercent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              className="mt-2"
              disabled={!canWrite}
              {...register('defaultMakingFeePercent')}
            />
          </div>
        </div>
        <SettingsToggleRow
          id="useLivePricingForProducts"
          label="قیمت زنده برای کاتالوگ"
          description="محصولات با وزن و اجرت بر اساس نرخ لحظه‌ای محاسبه می‌شوند."
          checked={livePricing}
          disabled={!canWrite}
          onChange={(v) => setValue('useLivePricingForProducts', v, { shouldDirty: true })}
        />
        <SettingsToggleRow
          id="showGoldTickerInHeader"
          label="تیکر قیمت در هدر فروشگاه"
          checked={ticker}
          disabled={!canWrite}
          onChange={(v) => setValue('showGoldTickerInHeader', v, { shouldDirty: true })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="معاملات آب‌شده"
        description="مقادیر پیش‌فرض هم‌خوان با متغیرهای GOLD_* در API."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="spreadPercent">اسپرد خرید/فروش (%)</Label>
            <Input
              id="spreadPercent"
              type="number"
              min={0}
              step="0.1"
              className="mt-2"
              disabled={!canWrite}
              {...register('spreadPercent')}
            />
            {errors.spreadPercent ? (
              <p className="mt-1 text-xs text-rose-600">{errors.spreadPercent.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="tradeCommissionPercent">کارمزد معامله (%)</Label>
            <Input
              id="tradeCommissionPercent"
              type="number"
              min={0}
              step="0.1"
              className="mt-2"
              disabled={!canWrite}
              {...register('tradeCommissionPercent')}
            />
          </div>
          <div>
            <Label htmlFor="minTradeGram">حداقل حجم معامله (گرم)</Label>
            <Input
              id="minTradeGram"
              type="number"
              min={0.001}
              step="0.01"
              dir="ltr"
              className="mt-2 text-left"
              disabled={!canWrite}
              {...register('minTradeGram')}
            />
          </div>
          <div>
            <Label htmlFor="marketRefreshSeconds">بازخوانی بازار (ثانیه)</Label>
            <Input
              id="marketRefreshSeconds"
              type="number"
              min={15}
              className="mt-2"
              disabled={!canWrite}
              {...register('marketRefreshSeconds')}
            />
          </div>
        </div>
        <p className="text-xs leading-5 text-stone-500">
          منبع بازار: BRS / fallback — پس از اتصال API تنظیمات، این مقادیر در Redis و worker اعمال
          می‌شوند.
        </p>
      </SettingsSectionCard>

      <SettingsFormFooter
        canWrite={canWrite}
        isSubmitting={isSubmitting}
        onReset={() => {
          resetSection('gold');
          reset(usePlatformSettingsStore.getState().gold);
        }}
      />
    </form>
  );
}
