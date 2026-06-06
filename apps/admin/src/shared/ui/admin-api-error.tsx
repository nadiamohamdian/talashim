'use client';

import { Button } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/shared/api/axios-client';

interface AdminApiErrorProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const message = 'message' in error ? String(error.message) : '';
  return message.includes('Network Error') || message.includes('ERR_CONNECTION');
}

export function AdminApiError({
  title = 'بارگذاری ناموفق بود.',
  error,
  onRetry,
  className,
}: AdminApiErrorProps) {
  const detail = error ? getApiErrorMessage(error) : null;
  const offline = isConnectionError(error);

  return (
    <div
      className={`flex flex-col items-center gap-4 px-6 py-10 text-center ${className ?? ''}`}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-100">
        <svg
          className="h-6 w-6 text-rose-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-md space-y-2">
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        {offline ? (
          <p className="text-sm leading-7 text-stone-600">
            اتصال به API برقرار نیست. سرویس API را اجرا کنید:{' '}
            <code className="rounded bg-nude-50 px-1.5 py-0.5 text-xs text-stone-700" dir="ltr">
              pnpm dev:api
            </code>
          </p>
        ) : detail ? (
          <p className="text-sm leading-7 text-stone-600">{detail}</p>
        ) : null}
      </div>

      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="border-border px-4 py-2 text-sm">
          تلاش مجدد
        </Button>
      ) : null}
    </div>
  );
}
