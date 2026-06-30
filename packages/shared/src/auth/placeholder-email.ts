const PLACEHOLDER_PHONE_EMAIL_SUFFIX = '@phone.talashim.local';

export function isPlaceholderPhoneEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(PLACEHOLDER_PHONE_EMAIL_SUFFIX);
}

export function buildPlaceholderPhoneEmail(phone: string): string {
  return `${phone}${PLACEHOLDER_PHONE_EMAIL_SUFFIX}`;
}
