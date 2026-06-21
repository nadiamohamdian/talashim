'use client';

import { useId } from 'react';

interface ProfileOutlinedInputProps {
  id?: string;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'tel' | 'email';
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  maxLength?: number;
  readOnly?: boolean;
  numeric?: boolean;
  error?: string;
}

export function ProfileOutlinedInput({
  id,
  placeholder,
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
}: ProfileOutlinedInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="profile-outlined-field">
      <input
        id={inputId}
        className={[
          'profile-outlined-input',
          numeric ? 'profile-outlined-input--num' : '',
          error ? 'profile-outlined-input--error' : '',
          readOnly ? 'profile-outlined-input--readonly' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        onBlur={onBlur}
      />
      {error ? <p className="profile-outlined-error">{error}</p> : null}
    </div>
  );
}
