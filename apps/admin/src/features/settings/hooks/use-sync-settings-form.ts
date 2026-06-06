'use client';

import { useEffect } from 'react';
import type { FieldValues, UseFormReset } from 'react-hook-form';

export function useSyncSettingsForm<T extends FieldValues>(
  values: T,
  reset: UseFormReset<T>,
  isDirty = false,
): void {
  useEffect(() => {
    if (!isDirty) {
      reset(values);
    }
  }, [values, reset, isDirty]);
}
