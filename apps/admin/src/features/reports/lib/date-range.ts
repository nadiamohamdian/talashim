import { tehranDayBoundaryIso } from '@/shared/lib/jalaali';

export function defaultReportFrom(): string {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  return tehranDayBoundaryIso(thirtyDaysAgo, false);
}

export function defaultReportTo(): string {
  return tehranDayBoundaryIso(new Date(), true);
}
