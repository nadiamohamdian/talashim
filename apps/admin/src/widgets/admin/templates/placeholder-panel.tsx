interface PlaceholderPanelProps {
  template: 'detail' | 'settings';
  moduleLabel: string;
}

export function PlaceholderPanel({ template, moduleLabel }: PlaceholderPanelProps) {
  return (
    <div className="card-luxury p-6">
      <p className="text-sm font-medium text-foreground">{moduleLabel}</p>
      <div className="mt-4 space-y-3">
        <div className="h-10 rounded-[var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-10 rounded-[var(--radius-md)] bg-[var(--surface)]" />
        {template === 'detail' ? (
          <div className="h-24 rounded-[var(--radius-md)] bg-[var(--surface)]" />
        ) : null}
      </div>
    </div>
  );
}
