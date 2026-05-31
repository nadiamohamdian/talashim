import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Label({
  children,
  className,
  ...props
}: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label
      className={cn('text-sm font-medium text-stone-700 dark:text-zinc-300', className)}
      {...props}
    >
      {children}
    </label>
  );
}
