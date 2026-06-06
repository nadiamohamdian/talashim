'use client';

import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';

export function ContactInfoPanel() {
  const { general } = useStorefrontSettings();

  return (
    <div className="card-luxury space-y-4 p-6 text-sm leading-7 text-muted">
      <div>
        <p className="font-semibold text-foreground">تلفن پشتیبانی</p>
        <p dir="ltr" className="mt-1 text-left">
          {general.supportPhone}
        </p>
      </div>
      <div>
        <p className="font-semibold text-foreground">ایمیل</p>
        <p dir="ltr" className="mt-1 text-left">
          {general.supportEmail}
        </p>
      </div>
      <div>
        <p className="font-semibold text-foreground">آدرس</p>
        <p className="mt-1">{general.contactAddress}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">ساعات پاسخ‌گویی</p>
        <p className="mt-1">{general.businessHours}</p>
      </div>
    </div>
  );
}
