export function defaultReportFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function defaultReportTo(): string {
  return new Date().toISOString();
}

export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function fromDateInputValue(value: string, endOfDay = false): string {
  const d = new Date(value);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}
