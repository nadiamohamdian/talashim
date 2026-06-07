import type { IconComponent } from '@/shared/ui/icons';
import type { ReactNode } from 'react';
import {
  LEGACY_STAT_ACCENT_MAP,
  STAT_ACCENT_STYLES,
  type StatAccent,
} from '@/shared/lib/admin-section-theme';
import { AnimatedNumber } from '@/widgets/admin/animated-number';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: IconComponent;
  accent?: StatAccent | keyof typeof LEGACY_STAT_ACCENT_MAP;
  variant?: 'default' | 'featured';
  className?: string;
  animateValue?: number;
  formatValue?: (value: number) => string;
}

function resolveAccent(accent: StatCardProps['accent']): StatAccent {
  if (!accent) return 'gold';
  if (accent in STAT_ACCENT_STYLES) return accent as StatAccent;
  return LEGACY_STAT_ACCENT_MAP[accent] ?? 'gold';
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'gold',
  variant = 'default',
  className = '',
  animateValue,
  formatValue,
}: StatCardProps) {
  const tone = STAT_ACCENT_STYLES[resolveAccent(accent)];
  const isFeatured = variant === 'featured';

  const renderedValue =
    animateValue !== undefined ? (
      <AnimatedNumber
        value={animateValue}
        format={formatValue ?? ((n) => n.toLocaleString('fa-IR'))}
      />
    ) : (
      value
    );

  return (
    <div
      className={`kpi-card ${isFeatured ? 'kpi-card--featured' : ''} ${className}`.trim()}
    >
      {Icon ? (
        <div
          className="kpi-icon-wrap"
          style={{
            background: tone.bg,
            color: tone.color,
            boxShadow: `inset 0 0 0 1px ${tone.ring}`,
          }}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </div>
      ) : null}

      <div className="kpi-card-content">
        <p className={`kpi-value ${isFeatured ? 'kpi-value--featured' : ''}`}>{renderedValue}</p>
        <p className="kpi-label">{label}</p>
        {hint ? <p className="kpi-hint">{hint}</p> : null}
      </div>
    </div>
  );
}
