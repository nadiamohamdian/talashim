import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function IconAccountSidebarAvatar(props: IconProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" {...props}>
      <circle cx="30" cy="21" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M15 46c2.8-9.5 24.2-9.5 30 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAccountSidebarOrders(props: IconProps) {
  return (
    <svg viewBox="0 0 24 30" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6h12v18H6V6z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M9 6V4.5h6V6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M6 9h12" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M9 3.5c0-1 1-2 3-2s3 1 3 2"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAccountSidebarTracking(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9z"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M12 13v9M4 8.5 12 13l8-4.5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export function IconAccountSidebarProfile(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M8.5 16.5c.8-2 2.2-3 3.5-3s2.7 1 3.5 3"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAccountSidebarLogout(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H9"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path d="M13 12h8M17.5 8.5 21 12l-3.5 3.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
