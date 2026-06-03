import { CommerceSettingsForm } from '@/features/settings/components/commerce-settings-form';
import { SettingsPageShell } from '@/features/settings/components/settings-page-shell';

export default function Page() {
  return (
    <SettingsPageShell routeId="settings.commerce">
      <CommerceSettingsForm />
    </SettingsPageShell>
  );
}
