import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-950 outline-none ring-amber-400 transition placeholder:text-stone-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500',
        className,
      )}
      {...props}
    />
  );
}
