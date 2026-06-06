'use client';

import { Input, Label } from '@talashim/ui';
import { formatIntegerFa, parseIntegerDigits } from '@/shared/lib/format-input';

interface FormattedNumberInputProps {
  label?: string;
  value: string;
  onChange: (rawDigits: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  hint?: string;
  suffix?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormattedNumberInput({
  label,
  value,
  onChange,
  className,
  inputClassName,
  placeholder = '۰',
  hint,
  suffix = 'تومان',
  required,
  disabled,
}: FormattedNumberInputProps) {
  const display = formatIntegerFa(value);

  return (
    <div className={className}>
      {label ? (
        <Label>
          {label}
          {required ? ' *' : null}
        </Label>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      <div className="relative mt-1">
        <Input
          inputMode="numeric"
          disabled={disabled}
          placeholder={placeholder}
          dir="ltr"
          className={`pl-16 text-left font-medium tracking-wide ${inputClassName ?? ''}`}
          value={display}
          onChange={(event) => onChange(parseIntegerDigits(event.target.value))}
        />
        {suffix ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
