'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Input, Label } from '@talashim/ui';
import { passwordLoginSchema, type PasswordLoginValues } from '@talashim/shared/validation/auth';
import { isAdminDevLoginEnabled } from '@/shared/config/env';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { adminLogin } from '../api/auth-api';
import { useAdminAuthStore } from '../model/admin-auth-store';

export function AdminLoginForm() {
  const devLogin = isAdminDevLoginEnabled();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: 'admin@talashim.local', password: 'Admin12345!' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await adminLogin(values);
      setSession(session);
      window.location.assign('/');
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error, 'ورود ناموفق بود'),
      });
    }
  });

  return (
    <div className="card-luxury w-full max-w-md p-6 sm:p-8">
      <p className="text-sm font-medium text-amber-800">پنل مدیریت</p>
      <h1 className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl">
        ورود به پنل مدیریت طلاشیم
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        مدیریت محصولات، سفارش‌ها، معاملات طلا و عملیات پلتفرم.
      </p>

      {devLogin ? (
        <Alert className="mt-4 border-amber-200/80 bg-amber-50/90 text-amber-950">
          حالت توسعه: ورود از API واقعی انجام می‌شود. حساب seed:{' '}
          <code className="text-xs">admin@talashim.local</code> /{' '}
          <code className="text-xs">Admin12345!</code> — در dev هر رمز برای staff هم
          پذیرفته می‌شود.
        </Alert>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input
            id="email"
            type="email"
            className="mt-2 border-border bg-card"
            placeholder="admin@talashim.local"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">رمز عبور</Label>
          <Input
            id="password"
            type="password"
            className="mt-2 border-border bg-card"
            placeholder="هر رمزی برای تست"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>
        {errors.root ? <Alert variant="destructive">{errors.root.message}</Alert> : null}
        <button type="submit" className="btn-gold w-full" disabled={isSubmitting}>
          {isSubmitting ? 'در حال ورود...' : 'ورود به پنل'}
        </button>
        <p className="text-center text-xs text-stone-500">
          <a href="http://localhost:3000" className="font-semibold text-amber-800 hover:underline">
            بازگشت به فروشگاه
          </a>
        </p>
      </form>
    </div>
  );
}
