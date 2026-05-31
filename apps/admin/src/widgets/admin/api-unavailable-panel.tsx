import type { ApiRequirementBlock } from '@/shared/config/api-requirements';

interface ApiUnavailablePanelProps extends ApiRequirementBlock {
  connectedNote?: string;
}

export function ApiUnavailablePanel({
  title,
  summary,
  endpoints,
  connectedNote,
}: ApiUnavailablePanelProps) {
  return (
    <div className="card-luxury border-amber-200/60 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
          ◆
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <p className="mt-1 text-sm text-stone-600">{summary}</p>
          {connectedNote ? <p className="mt-2 text-xs text-emerald-700">{connectedNote}</p> : null}
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-nude-50 text-xs uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium">Endpoint</th>
                  <th className="px-4 py-2 font-medium">توضیح</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep) => (
                  <tr
                    key={`${ep.method}-${ep.path}`}
                    className="border-b border-border/80 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-amber-800">{ep.method}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-stone-700" dir="ltr">
                      /api/v1{ep.path}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
