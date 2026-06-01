import type { ReportKpi } from '@sadafgold/types';
import { StatCard } from '@/widgets/admin/stat-card';

interface ReportKpiGridProps {
  kpis: ReportKpi[];
}

export function ReportKpiGrid({ kpis }: ReportKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.key}
          label={kpi.label}
          value={typeof kpi.value === 'number' ? kpi.value.toLocaleString('fa-IR') : kpi.value}
          hint={kpi.hint}
        />
      ))}
    </div>
  );
}
