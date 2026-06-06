import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}
