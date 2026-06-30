import { redirect } from 'next/navigation';
import { PROFILE_ONBOARDING_PATH } from '@/shared/routing/routes.config';

export default function AccountSetupPage() {
  redirect(PROFILE_ONBOARDING_PATH);
}
