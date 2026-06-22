import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const stroke = 'currentColor';
const iconStroke = '0.8';

export function IconAccountSidebarAvatar(props: IconProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" {...props}>
      <circle cx="30" cy="21" r="7.5" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M15 46c2.8-9.5 24.2-9.5 30 0"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma account hub — shopping bag */
export function IconAccountSidebarOrders(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="5.5" y="8.5" width="13" height="12" rx="1.2" stroke={stroke} strokeWidth={iconStroke} />
      <path
        d="M8.5 8.5V5.8C8.5 4.1 10 2.8 12 2.8C14 2.8 15.5 4.1 15.5 5.8V8.5"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12.8C9.6 15.2 14.4 15.2 15.5 12.8"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Figma account hub — package / tracking */
export function IconAccountSidebarTracking(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5L4.5 7.8V16.2L12 20.5L19.5 16.2V7.8L12 3.5Z"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinejoin="round"
      />
      <path d="M12 3.5V20.5" stroke={stroke} strokeWidth={iconStroke} strokeLinejoin="round" />
      <path d="M4.5 7.8L12 12.2L19.5 7.8" stroke={stroke} strokeWidth={iconStroke} strokeLinejoin="round" />
      <path d="M12 12.2V20.5" stroke={stroke} strokeWidth={iconStroke} strokeLinejoin="round" />
    </svg>
  );
}

/** Figma account hub — invoices */
export function IconAccountSidebarInvoices(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="5.5" y="3.5" width="13" height="17" rx="1" stroke={stroke} strokeWidth={iconStroke} />
      <path d="M8.5 8.5H15.5" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <path d="M8.5 12H15.5" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <path d="M8.5 15.5H12.5" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
    </svg>
  );
}

/** Figma account hub — addresses */
export function IconAccountSidebarAddresses(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 20.5C12 20.5 18 14.8 18 10.5C18 7.46 15.54 5 12 5C8.46 5 6 7.46 6 10.5C6 14.8 12 20.5 12 20.5Z"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.5" r="2.2" stroke={stroke} strokeWidth={iconStroke} />
    </svg>
  );
}

/** Figma account hub — wishlist */
export function IconAccountSidebarWishlist(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 19.8C12 19.8 5.5 14.9 5.5 9.9C5.5 7.4 7.5 5.5 10 5.5C11.2 5.5 12.3 6 13 6.9C13.7 6 14.8 5.5 16 5.5C18.5 5.5 20.5 7.4 20.5 9.9C20.5 14.9 12 19.8 12 19.8Z"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma account hub — profile with corner brackets */
export function IconAccountSidebarProfile(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M8 5.5H5.5V8" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <path d="M16 5.5H18.5V8" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <path d="M8 18.5H5.5V16" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <path d="M16 18.5H18.5V16" stroke={stroke} strokeWidth={iconStroke} strokeLinecap="round" />
      <circle cx="12" cy="10" r="2.4" stroke={stroke} strokeWidth={iconStroke} />
      <path
        d="M8.6 15.2C9.3 13.4 10.5 12.6 12 12.6C13.5 12.6 14.7 13.4 15.4 15.2"
        stroke={stroke}
        strokeWidth={iconStroke}
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
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinecap="round"
      />
      <path
        d="M13 12h8M17.5 8.5 21 12l-3.5 3.5"
        stroke={stroke}
        strokeWidth={iconStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
