'use client';

import { useCallback, useEffect, useState } from 'react';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

const OTP_EXPIRY_KEY_PREFIX = 'otp_expires_';
const DEFAULT_OTP_SECONDS = 180;

function readSecondsLeft(identifier: string): number {
  if (!identifier || typeof window === 'undefined') {
    return 0;
  }

  const stored = sessionStorage.getItem(`${OTP_EXPIRY_KEY_PREFIX}${identifier}`);
  if (!stored) {
    return 0;
  }

  return Math.max(0, Math.floor((Number(stored) - Date.now()) / 1000));
}

export function storeOtpExpiry(identifier: string, expiresInSeconds: number): void {
  if (!identifier || typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(
    `${OTP_EXPIRY_KEY_PREFIX}${identifier}`,
    String(Date.now() + expiresInSeconds * 1000),
  );
}

export function useOtpCountdown(identifier: string) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const sync = useCallback(() => {
    setSecondsLeft(readSecondsLeft(identifier));
  }, [identifier]);

  useEffect(() => {
    if (!identifier) {
      setSecondsLeft(0);
      return undefined;
    }

    if (readSecondsLeft(identifier) === 0) {
      storeOtpExpiry(identifier, DEFAULT_OTP_SECONDS);
    }

    sync();
    const intervalId = window.setInterval(sync, 1000);
    return () => window.clearInterval(intervalId);
  }, [identifier, sync]);

  const reset = useCallback(
    (expiresInSeconds: number) => {
      storeOtpExpiry(identifier, expiresInSeconds);
      sync();
    },
    [identifier, sync],
  );

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${toPersianDigits(String(minutes).padStart(2, '0'))}:${toPersianDigits(String(seconds).padStart(2, '0'))}`;

  return {
    secondsLeft,
    formatted,
    canResend: secondsLeft === 0,
    reset,
  };
}
