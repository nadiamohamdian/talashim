import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-[var(--radius-lg,0.625rem)] bg-[var(--surface-muted,#ece8e3)]',
        className,
      )}
      {...props}
    />
  );
}
