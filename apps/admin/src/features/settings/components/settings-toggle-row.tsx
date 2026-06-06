'use client';

import { Label } from '@talashim/ui';

interface SettingsToggleRowProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingsToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 transition hover:border-[var(--primary)]/30">
      <div className="min-w-0">
        <Label htmlFor={id}>{label}</Label>
        {description ? <p className="mt-1 text-caption leading-relaxed">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? 'border-[var(--primary)] bg-[var(--primary)]'
            : 'border-[var(--border)] bg-[var(--surface-muted)]'
        }`}
      >
        <span
          className="absolute top-0.5 size-5 rounded-full bg-white shadow-[var(--shadow-xs)] transition-[inset-inline-start] duration-200"
          style={{ insetInlineStart: checked ? '1.25rem' : '0.125rem' }}
        />
      </button>
    </div>
  );
}
