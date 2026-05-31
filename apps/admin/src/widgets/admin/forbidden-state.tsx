import type { AdminPermissionKey } from '@/shared/config/admin-permissions';

interface ForbiddenStateProps {
  permission?: AdminPermissionKey;
}

export function ForbiddenState({ permission }: ForbiddenStateProps) {
  return (
    <div className="card-luxury border-rose-200/80 p-8 text-center">
      <p className="text-lg font-semibold text-stone-900">دسترسی مجاز نیست</p>
      <p className="mt-2 text-sm text-stone-600">نقش شما مجوز مشاهده این صفحه را ندارد.</p>
      {permission ? (
        <p className="mt-4 font-mono text-xs text-stone-500" dir="ltr">
          {permission}
        </p>
      ) : null}
    </div>
  );
}
