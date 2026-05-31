'use client';

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
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        قبلی
      </Button>
      <span className="text-sm text-stone-500">
        {page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}
      </span>
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        بعدی
      </Button>
    </div>
  );
}
