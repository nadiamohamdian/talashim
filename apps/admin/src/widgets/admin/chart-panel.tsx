import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Premium chart container — presentation only */
export function ChartPanel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: ChartPanelProps) {
  return (
    <section className={`chart-panel ${className}`.trim()}>
      <header className="chart-panel-header">
        <div className="min-w-0">
          <h3 className="chart-panel-title">{title}</h3>
          {subtitle ? <p className="chart-panel-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="chart-panel-action">{action}</div> : null}
      </header>
      <div className="chart-panel-body">{children}</div>
    </section>
  );
}
