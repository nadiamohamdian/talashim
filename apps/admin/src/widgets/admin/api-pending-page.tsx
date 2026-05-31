import type { ApiRequirementBlock } from '@/shared/config/api-requirements';
import type { ApiAvailability } from '@/shared/config/admin-navigation';
import { ApiUnavailablePanel } from './api-unavailable-panel';
import { PageHeader } from './page-header';

interface ApiPendingPageProps extends ApiRequirementBlock {
  availability?: ApiAvailability;
  connectedNote?: string;
}

export function ApiPendingPage({
  title,
  summary,
  endpoints,
  availability = 'pending',
  connectedNote,
}: ApiPendingPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={summary} availability={availability} />
      <ApiUnavailablePanel
        title="نیازمندی‌های Backend"
        summary="برای فعال‌سازی کامل این ماژول، تیم backend باید endpointهای زیر را اضافه کند."
        endpoints={endpoints}
        connectedNote={connectedNote}
      />
    </div>
  );
}
