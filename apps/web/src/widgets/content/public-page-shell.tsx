import type { PropsWithChildren } from 'react';

interface PublicPageShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <div className="store-chrome-light space-y-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-amber-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950 dark:text-zinc-50">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
