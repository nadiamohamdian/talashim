import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type AlertVariant = 'default' | 'destructive' | 'success';

const variantMap: Record<AlertVariant, string> = {
  default:
    'border-stone-200 bg-stone-50 text-stone-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100',
  destructive:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100',
};

export function Alert({
  children,
  className,
  variant = 'default',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }>) {
  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 text-sm', variantMap[variant], className)}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}
