import { Skeleton } from '@sadafgold/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="h-10 w-72 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
