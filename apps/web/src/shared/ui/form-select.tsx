import type { SelectHTMLAttributes } from 'react';

const selectClassName =
  'flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-950 outline-none ring-amber-400 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50';

export function FormSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={[selectClassName, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </select>
  );
}
