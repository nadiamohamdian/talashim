'use client';

import { AlertCircle } from '@/shared/ui/icons';
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
      <div className="flex size-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--error-bg)] text-[var(--error)]">
        <AlertCircle className="size-6" strokeWidth={1.75} aria-hidden />
      </div>

      <div className="max-w-md space-y-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {offline ? (
          <p className="text-sm leading-relaxed text-muted">
            اتصال به API برقرار نیست. سرویس API را اجرا کنید:{' '}
            <code
              className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-1.5 py-0.5 text-xs text-foreground"
              dir="ltr"
            >
              pnpm dev:api
            </code>
          </p>
        ) : detail ? (
          <p className="text-sm leading-relaxed text-muted">{detail}</p>
        ) : null}
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          تلاش مجدد
        </Button>
      ) : null}
    </div>
  );
}
