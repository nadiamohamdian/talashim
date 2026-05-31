import { Card } from '@sadafgold/ui';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-stone-950 dark:text-zinc-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </Card>
  );
}
