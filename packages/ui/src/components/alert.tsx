import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

const variantMap: Record<AlertVariant, string> = {
  default:
    'border-[var(--border,#d9d0c8)] bg-[var(--surface,#f5f1ec)] text-[var(--foreground,#564739)]',
  destructive:
    'border-[var(--error-border,#ebcaca)] bg-[var(--error-bg,#fdf0f0)] text-[var(--error,#b54a4a)]',
  success:
    'border-[var(--success-border,#c5ddd0)] bg-[var(--success-bg,#eef6f1)] text-[var(--success,#3d7a5f)]',
  warning:
    'border-[var(--warning-border,#e8d5b5)] bg-[var(--warning-bg,#faf3e8)] text-[var(--warning,#b8955c)]',
  info:
    'border-[var(--info-border,#c8d8e0)] bg-[var(--info-bg,#eef4f7)] text-[var(--info,#5a7a8c)]',
};

export function Alert({
  children,
  className,
  variant = 'default',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)] border px-4 py-3 text-sm leading-relaxed',
        variantMap[variant],
        className,
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}
