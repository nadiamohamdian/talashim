import { ShieldX } from '@/shared/ui/icons';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';

interface ForbiddenStateProps {
  permission?: AdminPermissionKey;
}

export function ForbiddenState({ permission }: ForbiddenStateProps) {
  return (
    <div className="card-luxury flex flex-col items-center px-8 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--error-bg)] text-[var(--error)]">
        <ShieldX className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 text-h3">دسترسی مجاز نیست</p>
      <p className="mt-2 max-w-sm text-sm text-muted">
        نقش شما مجوز مشاهده این صفحه را ندارد. در صورت نیاز با سوپر ادمین تماس بگیرید.
      </p>
      {permission ? (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-muted" dir="ltr">
          {permission}
        </p>
      ) : null}
    </div>
  );
}
