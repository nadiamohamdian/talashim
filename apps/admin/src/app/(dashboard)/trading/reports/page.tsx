import { redirect } from 'next/navigation';

/** Canonical trading analytics live under Reports. */
export default function Page() {
  redirect('/reports/trading');
}
