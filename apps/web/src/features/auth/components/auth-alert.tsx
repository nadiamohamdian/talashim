import type { PropsWithChildren } from 'react';

type AuthAlertVariant = 'success' | 'error';

interface AuthAlertProps extends PropsWithChildren {
  variant: AuthAlertVariant;
}

function AuthAlertIcon({ variant }: { variant: AuthAlertVariant }) {
  return (
    <span className={`auth-alert-icon auth-alert-icon--${variant}`} aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="currentColor" />
        <path
          d="M6.25 10.25L8.75 12.75L13.75 7.25"
          stroke="#FFFFFF"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function AuthAlert({ variant, children }: AuthAlertProps) {
  return (
    <div
      className={`auth-alert auth-alert--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <AuthAlertIcon variant={variant} />
      <p className="auth-alert-text">{children}</p>
    </div>
  );
}
