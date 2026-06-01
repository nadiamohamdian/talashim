import type { ReactNode } from 'react';

interface SettingsSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSectionCard({ title, description, children }: SettingsSectionCardProps) {
  return (
    <section className="card-luxury overflow-hidden">
      <div className="border-b border-border bg-nude-50/80 px-5 py-4">
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-6 text-stone-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
