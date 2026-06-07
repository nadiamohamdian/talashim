import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'buy'
  | 'sell';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--primary,#cba670)] text-[var(--primary-foreground,#453a31)] hover:bg-[var(--primary-hover,#b8955c)] active:bg-[var(--primary-active,#a8844f)] shadow-[var(--shadow-xs)] font-semibold',
  secondary:
    'border border-[var(--border,#d4ccc4)] bg-transparent text-[var(--foreground,#453a31)] hover:bg-[var(--sidebar-hover,rgba(86,71,57,0.04))] hover:border-[var(--primary,#cba670)]/35',
  ghost:
    'bg-transparent text-[var(--foreground,#564739)] hover:bg-[var(--sidebar-hover,rgba(86,71,57,0.04))]',
  outline:
    'border border-[var(--border,#d9d0c8)] bg-[var(--card,#fff)] text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f7f4f0)] hover:border-[var(--primary,#cba670)]/40',
  destructive:
    'border border-[var(--error,#b54a4a)]/30 bg-transparent text-[var(--error,#b54a4a)] hover:bg-[var(--error-bg,#fdf0f0)]',
  success:
    'bg-[var(--success,#3d7a5f)] text-white hover:opacity-90',
  buy: 'bg-[var(--success,#3d7a5f)] text-white hover:opacity-90',
  sell: 'bg-[var(--error,#b54a4a)] text-white hover:opacity-90',
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-xs rounded-[var(--radius-md,0.5rem)]',
  md: 'h-10 gap-2 px-4 text-sm rounded-[var(--radius-lg,0.625rem)]',
  lg: 'h-11 gap-2 px-5 text-sm rounded-[var(--radius-lg,0.625rem)]',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 btn-luxury',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary,#cba670)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:scale-[0.99]',
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
