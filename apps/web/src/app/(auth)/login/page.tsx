import { Suspense } from 'react';
import { Card } from '@sadafgold/ui';
import { LoginSessionGuard } from '@/features/auth/components/login-session-guard';
import { LoginForm } from '@/features/auth/components/login-form';

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Suspense fallback={<Card className="p-8"><AuthBootScreenFallback /></Card>}>
        <LoginSessionGuard>
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-medium text-amber-700">احراز هویت</p>
            <h1 className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl dark:text-zinc-50">
              ورود به طلاشیم
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-zinc-400">
              فقط برای اقدامات محافظت‌شده (خرید، معامله، کیف پول). مرور فروشگاه بدون ورود
              امکان‌پذیر است.
            </p>
            <div className="mt-6">
              <LoginForm next={params.next ?? null} />
            </div>
          </Card>
        </LoginSessionGuard>
      </Suspense>
    </div>
  );
}

function AuthBootScreenFallback() {
  return (
    <p className="text-center text-sm text-stone-600">در حال بارگذاری...</p>
  );
}
