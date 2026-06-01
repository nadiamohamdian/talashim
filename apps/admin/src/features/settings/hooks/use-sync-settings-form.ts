'use client';

import { useEffect } from 'react';
import type { FieldValues, UseFormReset } from 'react-hook-form';

export function useSyncSettingsForm<T extends FieldValues>(
  values: T,
  reset: UseFormReset<T>,
): void {
  useEffect(() => {
    reset(values);
  }, [values, reset]);
}
