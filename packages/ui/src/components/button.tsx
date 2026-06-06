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
    'bg-[var(--primary,#cba670)] text-[var(--primary-foreground,#fff)] hover:bg-[var(--primary-hover,#b8955c)] active:bg-[var(--primary-active,#a8844f)] shadow-[var(--shadow-xs,0_1px_2px_rgba(0,0,0,0.05))]',
  secondary:
    'bg-[var(--secondary,#564739)] text-[var(--secondary-foreground,#faf7f4)] hover:bg-[var(--secondary-hover,#453a2e)]',
  ghost:
    'bg-transparent text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f5f1ec)]',
  outline:
    'border border-[var(--border,#d9d0c8)] bg-transparent text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f5f1ec)] hover:border-[var(--primary,#cba670)]',
  destructive:
    'bg-[var(--error,#b54a4a)] text-white hover:opacity-90',
  success:
    'bg-[var(--success,#3d7a5f)] text-white hover:opacity-90',
  buy: 'bg-[var(--success,#3d7a5f)] text-white hover:opacity-90',
  sell: 'bg-[var(--error,#b54a4a)] text-white hover:opacity-90',
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-[var(--radius-md,0.5rem)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-lg,0.75rem)]',
  lg: 'h-11 px-5 text-sm rounded-[var(--radius-lg,0.75rem)]',
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
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary,#cba670)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
