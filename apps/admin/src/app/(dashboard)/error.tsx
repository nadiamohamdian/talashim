'use client';

import { Button } from '@sadafgold/ui';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card-luxury mx-auto max-w-lg p-8 text-center">
      <p className="text-lg font-semibold text-foreground">خطا در بارگذاری صفحه</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {error.message || 'مشکلی در نمایش این بخش پیش آمد.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button className="h-10 px-4" onClick={() => reset()}>
          تلاش مجدد
        </Button>
        <Link href="/">
          <Button variant="outline" className="h-10 px-4">
            بازگشت به داشبورد
          </Button>
        </Link>
      </div>
    </div>
  );
}
