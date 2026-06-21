import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function IconAuthEditPhone(props: IconProps) {
  return (
    <svg viewBox="0 0 13 13" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.5 2.5l2 2M2.5 10.5 9.2 3.8l2 2L4.5 12.5H2.5v-2z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconAuthResend(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <path
        d="M11.5 7A4.5 4.5 0 1 1 7 2.5V1M7 1 9.5 3.5M7 1 4.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
