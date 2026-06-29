import Link from 'next/link';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface LensArchivePaginationProps {
  currentPage: number;
  totalPages: number;
}

function buildPageItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [totalPages, 'ellipsis', 3, 2, 1];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [totalPages, 'ellipsis', currentPage + 1, currentPage, currentPage - 1];
}

export function LensArchivePagination({ currentPage, totalPages }: LensArchivePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="lens-archive-pagination" aria-label="صفحه‌بندی لنز طلاشیم">
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="lens-archive-pagination-ellipsis">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        if (isActive) {
          return (
            <span
              key={page}
              className="lens-archive-pagination-item is-active"
              aria-current="page"
            >
              {toPersianDigits(page)}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={page === 1 ? '/lens' : `/lens?page=${page}`}
            className="lens-archive-pagination-item"
          >
            {toPersianDigits(page)}
          </Link>
        );
      })}
    </nav>
  );
}
