import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5 shadow-[var(--shadow-card)] sm:flex-row sm:flex-wrap sm:items-end ${className}`}>
      {children}
    </div>
  );
}
