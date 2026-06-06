import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Label({
  children,
  className,
  ...props
}: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label
      className={cn(
        'text-[var(--text-label,0.8125rem)] font-medium text-[var(--foreground,#564739)]',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
