import type { ReactNode } from 'react';

interface SettingsSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSectionCard({ title, description, children }: SettingsSectionCardProps) {
  return (
    <section className="card-luxury overflow-hidden">
      <div className="border-b border-[var(--divider)] bg-[var(--surface)] px-5 py-4">
        <h2 className="text-h3 text-base">{title}</h2>
        {description ? <p className="mt-1 text-caption leading-relaxed">{description}</p> : null}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
