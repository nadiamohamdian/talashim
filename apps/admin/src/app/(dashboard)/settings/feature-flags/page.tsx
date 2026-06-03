import { FeatureFlagsForm } from '@/features/settings/components/feature-flags-form';
import { SettingsPageShell } from '@/features/settings/components/settings-page-shell';

export default function Page() {
  return (
    <SettingsPageShell routeId="settings.featureFlags">
      <FeatureFlagsForm />
    </SettingsPageShell>
  );
}
