'use client';

import { ChevronLeft, ChevronRight } from '@/shared/ui/icons';
import { Button } from '@sadafgold/ui';

interface PaginationBarProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ page, total, limit, onPageChange }: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--divider)] pt-4">
      <p className="text-caption">
        صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
        <span className="mx-2 text-[var(--border)]">·</span>
        {total.toLocaleString('fa-IR')} مورد
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبلی"
        >
          <ChevronRight className="size-3.5" aria-hidden />
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="صفحه بعد"
        >
          بعدی
          <ChevronLeft className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
