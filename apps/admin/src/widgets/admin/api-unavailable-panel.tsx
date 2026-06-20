import type { ApiRequirementEndpoint } from '@/shared/config/api-requirements';

interface ApiUnavailablePanelProps {
  title: string;
  summary: string;
  endpoints: ApiRequirementEndpoint[];
  connectedNote?: string;
}

export function ApiUnavailablePanel({
  title,
  summary,
  endpoints,
  connectedNote,
}: ApiUnavailablePanelProps) {
  return (
    <section className="card-luxury p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted">{connectedNote ?? summary}</p>
      {endpoints.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs text-muted">
          {endpoints.map((endpoint) => (
            <li key={`${endpoint.method}:${endpoint.path}`} className="rounded-[var(--radius-md)] bg-[var(--surface)] px-3 py-2">
              <span className="font-mono text-foreground">{endpoint.method}</span>
              <span className="mx-2 font-mono">{endpoint.path}</span>
              {endpoint.description ? <span>{endpoint.description}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
