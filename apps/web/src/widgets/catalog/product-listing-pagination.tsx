import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface ProductListingPaginationProps {
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

export function ProductListingPagination({
  currentPage,
  totalPages,
}: ProductListingPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="product-listing-pagination" aria-label="صفحه‌بندی محصولات">
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="product-listing-pagination-ellipsis">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            className={
              isActive
                ? 'product-listing-pagination-item is-active'
                : 'product-listing-pagination-item'
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {toPersianDigits(page)}
          </button>
        );
      })}
    </nav>
  );
}
