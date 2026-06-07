'use client';

import { useEffect } from 'react';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[blog]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-xl font-bold text-stone-950 dark:text-zinc-50">بارگذاری مجله ناموفق بود</h1>
      <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-zinc-400">
        اتصال به API برقرار نیست یا سرویس بلاگ موقتاً در دسترس نیست.
      </p>
      <button type="button" className="btn-gold mt-6" onClick={reset}>
        تلاش مجدد
      </button>
    </div>
  );
}
