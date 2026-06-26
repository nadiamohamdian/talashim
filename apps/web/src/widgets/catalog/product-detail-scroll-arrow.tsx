interface ProductDetailScrollArrowProps {
  direction: 'prev' | 'next';
}

/** Figma dashed chevron — related products / carousel navigation */
export function ProductDetailScrollArrow({ direction }: ProductDetailScrollArrowProps) {
  return (
    <svg
      className={`product-details-scroll-arrow product-details-scroll-arrow--${direction}`}
      viewBox="0 0 35 19"
      fill="none"
      aria-hidden
    >
      {direction === 'prev' ? (
        <>
          <path
            d="M10.5 4.5L5 9.5L10.5 14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14.5 9.5H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24.5 9.5H31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path
            d="M24.5 4.5L30 9.5L24.5 14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20.5 9.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10.5 9.5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
