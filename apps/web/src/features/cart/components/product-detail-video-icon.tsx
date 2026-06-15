/** Figma product detail glass — play icon in circle, matches cart action glyph */
export function ProductDetailVideoIcon() {
  return (
    <span className="product-details-action-video-icon" aria-hidden>
      <svg
        className="product-details-action-video-glyph"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="11.5" stroke="#6D5945" strokeWidth="1" />
        <path
          d="M10.25 8.5l5.75 3.5-5.75 3.5V8.5Z"
          fill="#6D5945"
        />
      </svg>
    </span>
  );
}
