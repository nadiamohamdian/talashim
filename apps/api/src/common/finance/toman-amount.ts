export function tomanBigIntToNumber(value: bigint | number | null | undefined): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  return Number(value);
}

export function tomanNumberToBigInt(value: number): bigint {
  return BigInt(Math.round(value));
}
