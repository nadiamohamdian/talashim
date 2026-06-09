import type { PropsWithChildren } from 'react';

interface AuthPageShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

export function AuthPageShell({ eyebrow, title, description, children }: AuthPageShellProps) {
  return (
    <div className="auth-page store-chrome-light store-minimal-header">
      <div className="auth-page-inner">
        <div className="auth-card">
          <header className="auth-card-header">
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1 className="auth-title" aria-label={title}>
              {title}
            </h1>
            <p className="auth-description">{description}</p>
          </header>
          <div className="auth-card-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
