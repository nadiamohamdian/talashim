import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const stroke = 'currentColor';

/** Figma node 1755:8414 — search-icon */
export function IconMenuSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 14.8 14.8" fill="none" aria-hidden {...props}>
      <path
        d="M0.4 14.4L3.776 11.024"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.178 12.844C4.741 12.844 1.956 10.059 1.956 6.622C1.956 3.186 4.741 0.4 8.178 0.4C11.614 0.4 14.4 3.186 14.4 6.622C14.4 10.059 11.614 12.844 8.178 12.844Z"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma node 1755:8417 — profile-icon */
export function IconMenuProfile(props: IconProps) {
  return (
    <svg viewBox="0 0 13.27 14" fill="none" aria-hidden {...props}>
      <circle cx="6.635" cy="4.235" r="4.235" stroke={stroke} strokeWidth="0.8" />
      <path
        d="M0.4 13.6C2.2 10.8 4.8 9.4 6.635 9.4C8.47 9.4 11.07 10.8 12.87 13.6"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma node 1755:8420 — shopping-cart-icon (bag) */
export function IconMenuBag(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden {...props}>
      <rect x="0.4" y="2.4" width="11.2" height="9.2" rx="1" stroke={stroke} strokeWidth="0.8" />
      <path
        d="M3 2.4V1.6C3 0.9 3.6 0.4 4.4 0.4H7.6C8.4 0.4 9 0.9 9 1.6V2.4"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma node 1752:5649 — hamburger (2 lines) */
export function IconMenuHamburger(props: IconProps) {
  return (
    <svg viewBox="0 0 24 13" fill="none" aria-hidden {...props}>
      <line x1="4" y1="5" x2="20" y2="5" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4" y1="9" x2="20" y2="9" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** Drawer close — thin stroke matching menu icon set */
export function IconMenuClose(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden {...props}>
      <path d="M1 1L13 13M13 1L1 13" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** Accordion chevron — collapsed */
export function IconMenuChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 8 5" fill="none" aria-hidden {...props}>
      <path d="M1 1L4 4L7 1" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Accordion chevron — expanded */
export function IconMenuChevronUp(props: IconProps) {
  return (
    <svg viewBox="0 0 8 5" fill="none" aria-hidden {...props}>
      <path d="M1 4L4 1L7 4" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Figma node 1752:5901 — hero diagonal arrow CTA */
export function IconHeroArrowDiagonal(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke={stroke}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
