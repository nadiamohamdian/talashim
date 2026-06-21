'use client';

import { useId, useState } from 'react';
import { AuthAlert } from '@/features/auth/components/auth-alert';

interface AuthFloatingInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'tel' | 'email' | 'password';
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  maxLength?: number;
  readOnly?: boolean;
  numeric?: boolean;
  error?: string;
}

export function AuthFloatingInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  readOnly = false,
  numeric = false,
  error,
}: AuthFloatingInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const safeValue = value ?? '';
  const isActive = focused || safeValue.length > 0;

  return (
    <div className="auth-floating-field">
      <div
        className={[
          'auth-floating-input',
          isActive ? 'auth-floating-input--active' : '',
          error ? 'auth-floating-input--error' : '',
          readOnly ? 'auth-floating-input--readonly' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <label
          className={[
            'auth-floating-label',
            isActive ? 'auth-floating-label--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          htmlFor={inputId}
        >
          {label}
        </label>
        <input
          id={inputId}
          className={[
            'auth-floating-control',
            numeric ? 'auth-floating-control--num' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          readOnly={readOnly}
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
        />
      </div>
      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
    </div>
  );
}
