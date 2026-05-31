import { Card, Skeleton } from '@sadafgold/ui';

export function TradingDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-3 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <Skeleton className="h-48 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    </div>
  );
}
