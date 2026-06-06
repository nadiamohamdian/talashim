'use client';

import { Button } from '@talashim/ui';

interface SettingsFormFooterProps {
  canWrite: boolean;
  isSubmitting: boolean;
  onReset: () => void;
}

export function SettingsFormFooter({ canWrite, isSubmitting, onReset }: SettingsFormFooterProps) {
  if (!canWrite) {
    return (
      <p className="text-sm text-muted">
        شما فقط مجوز مشاهده دارید. ویرایش نیازمند دسترسی «تنظیمات — نوشتن» است.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--divider)] pt-4">
      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
      </Button>
      <Button type="button" variant="outline" disabled={isSubmitting} onClick={onReset}>
        بازنشانی بخش
      </Button>
    </div>
  );
}
