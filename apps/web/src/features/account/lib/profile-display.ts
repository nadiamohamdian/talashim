import type { UserProfile } from '@/lib/api/user.api';

const IR_MOBILE_PATTERN = /09\d{9}/;

function extractPhoneFromText(value: string): string | null {
  const match = value.match(IR_MOBILE_PATTERN);
  return match?.[0] ?? null;
}

export function resolveProfilePhone(profile: UserProfile | undefined): string | null {
  if (!profile) {
    return null;
  }

  if (profile.phone) {
    return profile.phone;
  }

  const phoneInFullName = extractPhoneFromText(profile.fullName);
  if (phoneInFullName) {
    return phoneInFullName;
  }

  if (profile.lastName && IR_MOBILE_PATTERN.test(profile.lastName)) {
    return profile.lastName;
  }

  return null;
}

export function resolveProfileDisplayName(profile: UserProfile | undefined): string {
  if (!profile) {
    return '';
  }

  const firstName = profile.firstName?.trim() ?? '';
  const lastName = profile.lastName?.trim() ?? '';

  if (firstName && lastName && !IR_MOBILE_PATTERN.test(lastName)) {
    return `${firstName} ${lastName}`.trim();
  }

  if (firstName && !IR_MOBILE_PATTERN.test(firstName)) {
    return firstName;
  }

  const cleanedFullName = profile.fullName
    .replace(IR_MOBILE_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanedFullName || profile.fullName.trim();
}
