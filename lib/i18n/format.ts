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

export function formatRelativeTime(value: string | number | Date, locale: Locale): string {
  const date = value instanceof Date ? value : parseDateValue(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) {
    return locale === "vi" ? "Vừa xong" : "Just now";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return locale === "vi" ? `${diffMinutes} phút trước` : `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return locale === "vi" ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return locale === "vi" ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  }
  return formatDate(date, locale, { dateStyle: "short" });
}
