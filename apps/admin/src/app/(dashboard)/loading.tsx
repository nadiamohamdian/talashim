import { Skeleton } from '@sadafgold/ui';

export default function DashboardLoading() {
  return (
    <div className="admin-page-stack animate-fade-in" aria-busy="true" aria-label="در حال بارگذاری">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="admin-grid-tight grid lg:grid-cols-2">
        <Skeleton className="h-60" />
        <Skeleton className="h-60" />
      </div>
    </div>
  );
}
