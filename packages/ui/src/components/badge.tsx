import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type BadgeVariant = 'default' | 'gold' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--surface,#f7f4f0)] text-[var(--foreground,#564739)] border-[var(--border,#d9d0c8)]',
  gold: 'bg-[var(--warning-bg,#faf3e8)] text-[var(--warning-foreground,#6d4f1a)] border-[var(--warning-border,#e8d5b5)]',
  success:
    'bg-[var(--success-bg,#eef6f1)] text-[var(--success,#3d7a5f)] border-[var(--success-border,#c5ddd0)]',
  warning:
    'bg-[var(--warning-bg,#faf3e8)] text-[var(--warning-foreground,#6d4f1a)] border-[var(--warning-border,#e8d5b5)]',
  error:
    'bg-[var(--error-bg,#fdf0f0)] text-[var(--error,#b54a4a)] border-[var(--error-border,#ebcaca)]',
  info: 'bg-[var(--info-bg,#eef4f7)] text-[var(--info,#5a7a8c)] border-[var(--info-border,#c8d8e0)]',
  outline: 'bg-transparent text-[var(--muted,#8a8078)] border-[var(--border,#d9d0c8)]',
};

export function Badge({
  children,
  className,
  variant = 'default',
  ...props
}: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-tight',
        variantMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
