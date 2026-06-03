import { redirect } from 'next/navigation';

/** Canonical financial analytics live under Reports. */
export default function Page() {
  redirect('/reports/financial');
}
