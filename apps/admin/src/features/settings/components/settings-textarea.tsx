import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@talashim/ui';

export function SettingsTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-foreground outline-none ring-[var(--primary)]/30 transition placeholder:text-muted focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
