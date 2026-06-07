import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-[var(--radius-lg,0.625rem)] border border-[var(--border)]',
        'bg-[var(--input-bg,#fffcf9)] px-4 py-2.5 text-[var(--text-body-lg,0.9375rem)] text-[var(--foreground,#453a31)]',
        'placeholder:text-[var(--muted,#8a7d72)]',
        'transition-[border-color,box-shadow] duration-150',
        'focus-visible:border-[var(--primary,#cba670)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary-muted,rgba(203,166,112,0.12))]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface,#f7f4f0)]',
        className,
      )}
      {...props}
    />
  );
}
