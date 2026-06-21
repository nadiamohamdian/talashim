interface BlogPostCarouselArrowProps {
  direction: 'prev' | 'next';
}

export function BlogPostCarouselArrow({ direction }: BlogPostCarouselArrowProps) {
  return (
    <svg
      viewBox="0 0 35 19"
      fill="none"
      aria-hidden
      className={`blog-post-carousel-nav-icon blog-post-carousel-nav-icon--${direction}`}
    >
      {direction === 'prev' ? (
        <>
          <path
            d="M6 9.5L12 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 9.5L12 14.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9.5H20.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M26.5 9.5H33"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M29 9.5L23 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 9.5L23 14.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 9.5H14.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M8.5 9.5H2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
