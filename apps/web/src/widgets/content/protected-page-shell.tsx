import type { PropsWithChildren } from 'react';

interface ProtectedPageShellProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function ProtectedPageShell({ title, description, children }: ProtectedPageShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-950 dark:text-zinc-50">{title}</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
