'use client';

import { Label } from '@sadafgold/ui';

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
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-white/60 px-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-stone-800">
          {label}
        </Label>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
        ) : null}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-stone-300 bg-stone-200 transition checked:border-gold-dark checked:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
