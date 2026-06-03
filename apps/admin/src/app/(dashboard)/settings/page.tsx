import { SettingsOverviewPanel } from '@/features/settings/components/settings-overview-panel';
import { SettingsPageShell } from '@/features/settings/components/settings-page-shell';

export default function Page() {
  return (
    <SettingsPageShell routeId="settings.home">
      <SettingsOverviewPanel />
    </SettingsPageShell>
  );
}
