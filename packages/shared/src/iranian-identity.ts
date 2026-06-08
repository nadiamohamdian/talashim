const IRAN_MOBILE_REGEX = /^09\d{9}$/;
const NATIONAL_ID_REGEX = /^\d{10}$/;

export function isValidIranMobile(phone: string): boolean {
  return IRAN_MOBILE_REGEX.test(phone.trim());
}

export function isValidIranNationalId(nationalId: string): boolean {
  const value = nationalId.trim();
  if (!NATIONAL_ID_REGEX.test(value)) {
    return false;
  }

  if (/^(\d)\1{9}$/.test(value)) {
    return false;
  }

  const check = Number(value[9]);
  const sum = value
    .slice(0, 9)
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;

  return remainder < 2 ? check === remainder : check === 11 - remainder;
}
