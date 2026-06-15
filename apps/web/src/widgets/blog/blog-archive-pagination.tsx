import Link from 'next/link';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface BlogArchivePaginationProps {
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

export function BlogArchivePagination({ currentPage, totalPages }: BlogArchivePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="blog-archive-pagination" aria-label="صفحه‌بندی مقالات">
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="blog-archive-pagination-ellipsis">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        if (isActive) {
          return (
            <span
              key={page}
              className="blog-archive-pagination-item is-active"
              aria-current="page"
            >
              {toPersianDigits(page)}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={page === 1 ? '/blog' : `/blog?page=${page}`}
            className="blog-archive-pagination-item"
          >
            {toPersianDigits(page)}
          </Link>
        );
      })}
    </nav>
  );
}
