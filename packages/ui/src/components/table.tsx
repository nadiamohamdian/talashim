import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const tableWrapClass =
  'w-full overflow-x-auto rounded-[var(--radius-xl,0.75rem)] border border-[var(--border-subtle,var(--border,#d9d0c8))] bg-[var(--card,#fff)] shadow-[var(--shadow-card)]';

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
        'sticky top-0 z-[1] bg-[var(--table-header,#f5f1ec)] [&_tr]:border-b [&_tr]:border-[var(--divider,#e3e3e3)]',
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
        'hover:bg-[var(--table-row-hover,rgba(203,166,112,0.05))]',
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
        'h-10 px-4 text-right align-middle text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--muted-foreground,#6b635c)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-[var(--text-body-lg,0.9375rem)] text-[var(--foreground,#564739)]',
        className,
      )}
      {...props}
    />
  );
}
