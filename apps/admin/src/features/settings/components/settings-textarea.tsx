import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@sadafgold/ui';

export function SettingsTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none ring-amber-400 transition placeholder:text-stone-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
