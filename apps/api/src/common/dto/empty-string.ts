/** Treat blank strings as missing optional fields for class-validator. */
export function emptyStringToUndefined({ value }: { value: unknown }): unknown {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}
