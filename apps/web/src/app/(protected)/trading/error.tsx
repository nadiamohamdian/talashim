'use client';

import { useEffect } from 'react';
import { Alert, Button } from '@sadafgold/ui';

export default function TradingRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[trading/error]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <Alert variant="destructive">
        <p className="font-semibold">خطا در بارگذاری صفحه معاملات</p>
        <p className="mt-2 text-xs opacity-90">{error.message}</p>
        <Button variant="outline" className="mt-4" onClick={reset}>
          تلاش مجدد
        </Button>
      </Alert>
    </div>
  );
}
