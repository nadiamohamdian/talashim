import { GoldSettingsForm } from '@/features/settings/components/gold-settings-form';
import { SettingsPageShell } from '@/features/settings/components/settings-page-shell';

export default function Page() {
  return (
    <SettingsPageShell routeId="settings.gold">
      <GoldSettingsForm />
    </SettingsPageShell>
  );
}
