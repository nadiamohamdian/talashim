import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl,1rem)] border border-[var(--border,#d9d0c8)] bg-[var(--card,#fff)]',
        'shadow-[var(--shadow-card,0_1px_3px_rgba(0,0,0,0.05))]',
        'transition-shadow duration-200 hover:shadow-[var(--shadow-hover,0_4px_20px_rgba(0,0,0,0.08))]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-[var(--divider,#e3e3e3)] px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3
      className={cn('text-[var(--text-h3,1.125rem)] font-semibold text-[var(--foreground,#564739)]', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn('text-sm text-[var(--muted,#8a8078)]', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-[var(--divider,#e3e3e3)] px-6 py-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
