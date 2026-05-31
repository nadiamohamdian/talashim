import { redirect } from 'next/navigation';

export default function LegacyKycRedirect() {
  redirect('/users/kyc');
}
