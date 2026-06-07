'use client';

import { Badge, Button } from '@talashim/ui';
import { getRoleLabelFa } from '@talashim/shared/admin-rbac';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';

export function AccountPanel() {
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();

  if (!user) return null;

  return (
    <div className="card-luxury w-full p-6 sm:p-8">
      <Badge className="w-[70px]">حساب کاربری</Badge>
      <h1 className="mt-4 text-2xl font-bold text-stone-950">سلام، {user.fullName}</h1>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4 border-b border-stone-100 pb-3">
          <dt className="text-stone-500">ایمیل</dt>
          <dd className="font-medium text-stone-950">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-stone-100 pb-3">
          <dt className="text-stone-500">نقش</dt>
          <dd className="font-medium text-stone-950">{getRoleLabelFa(user.role)}</dd>
        </div>
      </dl>
      <Button
        variant="secondary"
        className="mt-8 w-full sm:w-auto"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        {logoutMutation.isPending ? 'در حال خروج...' : 'خروج از حساب'}
      </Button>
    </div>
  );
}
