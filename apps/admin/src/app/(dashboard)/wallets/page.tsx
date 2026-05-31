import { redirect } from 'next/navigation';

export default function LegacyWalletsRedirect() {
  redirect('/finance/wallets');
}
