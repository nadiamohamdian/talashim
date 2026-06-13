import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const stroke = 'currentColor';
const menuStroke = '1.15';

/** Figma node 1755:8414 — search-icon */
export function IconMenuSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden {...props}>
      <path
        d="M0.4 13.6L3.6 10.4"
        stroke={stroke}
        strokeWidth={menuStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.8 12.2C4.7 12.2 2.2 9.7 2.2 6.6C2.2 3.5 4.7 1 7.8 1C10.9 1 13.4 3.5 13.4 6.6C13.4 9.7 10.9 12.2 7.8 12.2Z"
        stroke={stroke}
        strokeWidth={menuStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma node 1755:8417 — profile-icon */
export function IconMenuProfile(props: IconProps) {
  return (
    <svg viewBox="0 0 13.27 15" fill="none" aria-hidden {...props}>
      <circle cx="6.635" cy="4.235" r="4.035" stroke={stroke} strokeWidth={menuStroke} />
      <path
        d="M0.4 14.6C2.2 11.8 4.8 10.4 6.635 10.4C8.47 10.4 11.07 11.8 12.87 14.6"
        stroke={stroke}
        strokeWidth={menuStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma node 1875:924 — shopping-cart-icon (bag) */
export function IconMenuBag(props: IconProps) {
  return (
    <svg viewBox="0 0 12 15" fill="none" aria-hidden {...props}>
      <rect x="0.4" y="3.4" width="11.2" height="11.2" rx="1" stroke={stroke} strokeWidth={menuStroke} />
      <path
        d="M3.4 3.4V1.8C3.4 0.9 4.4 0.4 6 0.4C7.6 0.4 8.6 0.9 8.6 1.8V3.4"
        stroke={stroke}
        strokeWidth={menuStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 6.8C4.3 8.2 7.7 8.2 8.6 6.8"
        stroke={stroke}
        strokeWidth={menuStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma node 1752:5649 — hamburger (2 lines) */
export function IconMenuHamburger(props: IconProps) {
  return (
    <svg viewBox="0 0 24 13" fill="none" aria-hidden {...props}>
      <line x1="4" y1="5" x2="20" y2="5" stroke={stroke} strokeWidth={menuStroke} strokeLinecap="round" />
      <line x1="4" y1="9" x2="20" y2="9" stroke={stroke} strokeWidth={menuStroke} strokeLinecap="round" />
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
