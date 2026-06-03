import { redirect } from 'next/navigation';

/** Canonical inventory analytics live under Reports. */
export default function Page() {
  redirect('/reports/inventory');
}
