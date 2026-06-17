'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, Input, Label } from '@talashim/ui';
import { passwordLoginSchema, type PasswordLoginValues } from '@talashim/shared/validation/auth';
import { isAdminDevLoginEnabled } from '@/shared/config/env';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { syncAdminPermissionsFromApi } from '@/features/auth/lib/sync-admin-permissions';
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
      await syncAdminPermissionsFromApi();
      window.location.assign('/');
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error, 'ورود ناموفق بود'),
      });
    }
  });

  return (
    <div className="card-luxury w-full max-w-md bg-[var(--card)] text-[var(--foreground)] p-6 sm:p-7">
      <p className="text-caption font-semibold uppercase tracking-wider text-[var(--primary)]">
        پنل مدیریت
      </p>
      <h1 className="mt-2 text-display text-[var(--foreground)]">ورود به پنل مدیریت طلاشیم</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        مدیریت محصولات، سفارش‌ها، معاملات طلا و عملیات پلتفرم.
      </p>

      {devLogin ? (
        <Alert variant="warning" className="mt-5">
          حالت توسعه: ورود از API واقعی انجام می‌شود. حساب seed:{' '}
          <code className="text-xs">admin@talashim.local</code> /{' '}
          <code className="text-xs">Admin12345!</code>
        </Alert>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={(event) => void onSubmit(event)}>
        <div className="field-group">
          <Label htmlFor="email" className="text-[var(--foreground)]">
            ایمیل
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@talashim.local"
            className="border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            {...register('email')}
          />
          {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
        </div>
        <div className="field-group">
          <Label htmlFor="password" className="text-[var(--foreground)]">
            رمز عبور
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            {...register('password')}
          />
          {errors.password ? <p className="field-error">{errors.password.message}</p> : null}
        </div>
        {errors.root ? <Alert variant="destructive">{errors.root.message}</Alert> : null}
        <Button
          type="submit"
          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95"
          loading={isSubmitting}
        >
          {isSubmitting ? 'در حال ورود…' : 'ورود به پنل'}
        </Button>
        <p className="text-center text-caption">
          <a
            href="http://localhost:3000"
            className="font-medium text-[var(--primary)] transition hover:opacity-80"
          >
            بازگشت به فروشگاه
          </a>
        </p>
      </form>
    </div>
  );
}
