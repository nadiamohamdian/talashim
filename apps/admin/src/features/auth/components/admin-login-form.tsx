'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Alert, Button, Card, Input, Label } from '@sadafgold/ui';
import {
  passwordLoginSchema,
  type PasswordLoginValues,
} from '@sadafgold/shared/validation/auth';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { adminLogin } from '../api/auth-api';
import { useAdminAuthStore } from '../model/admin-auth-store';

export function AdminLoginForm() {
  const router = useRouter();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordLoginValues>({ resolver: zodResolver(passwordLoginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await adminLogin(values);
      setSession(session);
      router.replace('/');
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error, 'ورود ناموفق بود'),
      });
    }
  });

  return (
    <Card className="w-full max-w-md p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Enterprise Admin</p>
      <h1 className="mt-2 text-2xl font-bold">ورود پنل مدیریت</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input id="email" type="email" className="mt-2" {...register('email')} />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="password">رمز عبور</Label>
          <Input id="password" type="password" className="mt-2" {...register('password')} />
          {errors.password ? (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>
        {errors.root ? <Alert variant="destructive">{errors.root.message}</Alert> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'در حال ورود...' : 'ورود'}
        </Button>
      </form>
    </Card>
  );
}
