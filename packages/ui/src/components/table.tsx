import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const tableWrapClass =
  'w-full overflow-x-auto rounded-[var(--radius-xl,1rem)] border border-[var(--border,#d9d0c8)] bg-[var(--card,#fff)] shadow-[var(--shadow-soft,0_2px_8px_rgba(0,0,0,0.06))]';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={tableWrapClass}>
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-[var(--table-header,#f5f0eb)] [&_tr]:border-b [&_tr]:border-[var(--divider,#e3e3e3)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--divider,#e3e3e3)] transition-colors duration-100',
        'hover:bg-[var(--table-row-hover,rgba(203,166,112,0.06))]',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-right align-middle text-xs font-semibold tracking-wide text-[var(--muted-foreground,#6b635c)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 align-middle text-[var(--foreground,#564739)]', className)}
      {...props}
    />
  );
}
