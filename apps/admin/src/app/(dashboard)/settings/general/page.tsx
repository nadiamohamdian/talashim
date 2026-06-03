import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form';
import { SettingsPageShell } from '@/features/settings/components/settings-page-shell';

export default function Page() {
  return (
    <SettingsPageShell routeId="settings.general">
      <GeneralSettingsForm />
    </SettingsPageShell>
  );
}
