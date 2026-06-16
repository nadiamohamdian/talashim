'use client';

import { useId, useState, type ReactNode } from 'react';

interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: string;
  className?: string;
}

export function AdminFormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  badge,
  className = '',
}: AdminFormSectionProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <section className={`admin-form-section ${className}`.trim()}>
      {collapsible ? (
        <button
          type="button"
          className="admin-form-section-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="admin-form-section-trigger-text">
            <span className="admin-form-section-title">{title}</span>
            {description ? (
              <span className="admin-form-section-desc">{description}</span>
            ) : null}
          </span>
          <span className="admin-form-section-trigger-meta">
            {badge ? <span className="admin-form-section-badge">{badge}</span> : null}
            <span
              className={`admin-form-section-chevron${isOpen ? ' is-open' : ''}`}
              aria-hidden
            />
          </span>
        </button>
      ) : (
        <div className="admin-form-section-header-static">
          <div>
            <h2 className="admin-form-section-title">{title}</h2>
            {description ? (
              <p className="admin-form-section-desc">{description}</p>
            ) : null}
          </div>
          {badge ? <span className="admin-form-section-badge">{badge}</span> : null}
        </div>
      )}

      <div
        id={panelId}
        className={`admin-form-section-panel${isOpen ? ' is-open' : ''}`}
        hidden={!isOpen}
      >
        <div className="admin-form-section-body">{children}</div>
      </div>
    </section>
  );
}
