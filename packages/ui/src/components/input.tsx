import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-lg,0.625rem)] border border-[var(--border,#d9d0c8)]',
        'bg-[var(--input-bg,#fff)] px-3.5 py-2 text-sm text-[var(--foreground,#564739)]',
        'placeholder:text-[var(--muted,#8a8078)]',
        'transition-[border-color,box-shadow] duration-150',
        'focus-visible:border-[var(--primary,#cba670)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary-muted,rgba(203,166,112,0.12))]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface,#f7f4f0)]',
        className,
      )}
      {...props}
    />
  );
}
