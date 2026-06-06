import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-lg,0.75rem)] bg-[var(--surface-muted,#e3e3e3)]',
        className,
      )}
      {...props}
    />
  );
}
