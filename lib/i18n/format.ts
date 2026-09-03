import { getIntlLocale, type Locale } from "@/lib/i18n";

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function formatCurrency(value: number, locale: Locale, currency = "VND"): string {
  return formatNumber(value, locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  });
}

export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const date = value instanceof Date ? value : parseDateValue(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(date);
}

export function formatDateTime(value: string | number | Date, locale: Locale): string {
  return formatDate(value, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function parseDateValue(value: string | number): Date {
  if (typeof value !== "string") return new Date(value);

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateOnlyMatch) return new Date(value);

  const year = Number(dateOnlyMatch[1]);
  const month = Number(dateOnlyMatch[2]);
  const day = Number(dateOnlyMatch[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : new Date(Number.NaN);
}
