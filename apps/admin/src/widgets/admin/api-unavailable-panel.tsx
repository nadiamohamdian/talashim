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
    <div className="card-luxury space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{summary}</p>
        {connectedNote ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{connectedNote}</p>
        ) : null}
      </div>

      {endpoints.length > 0 ? (
        <ul className="space-y-3">
          {endpoints.map((endpoint) => (
            <li
              key={`${endpoint.method}-${endpoint.path}`}
              className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3"
            >
              <p className="font-mono text-sm text-[var(--foreground)]">
                <span className="text-[var(--primary)]">{endpoint.method}</span> {endpoint.path}
              </p>
              {endpoint.description ? (
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{endpoint.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
