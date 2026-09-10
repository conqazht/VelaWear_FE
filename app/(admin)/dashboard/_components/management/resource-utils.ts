import { getActiveLocale, getIntlLocale, type Locale } from "@/lib/i18n";
import { adminShellMessages } from "@/lib/i18n/messages/admin-shell";

export { getApiErrorStatus } from "@/lib/api/errors";

export function formatAdminDate(value?: string | null, locale: Locale = getActiveLocale()) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
  }).format(date);
}

export function formatAdminDateTime(value?: string | null, locale: Locale = getActiveLocale()) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(value?: number | null, locale: Locale = getActiveLocale()) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function resolveAdminAssetUrl(value?: string | null) {
  if (
    !value ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value ?? undefined;
  }

  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    const cleanPath = value.startsWith("/") ? value : `/${value}`;
    const explicitOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    if (explicitOrigin) {
      try {
        return `${new URL(explicitOrigin).origin}${cleanPath}`;
      } catch {
        return cleanPath;
      }
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl.startsWith("http")) {
      try {
        return `${new URL(apiUrl).origin}${cleanPath}`;
      } catch {
        return cleanPath;
      }
    }
    return cleanPath;
  }

  return value;
}

export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number | null | undefined>>,
) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null | undefined) => {
    const raw = value === null || value === undefined ? "" : String(value);
    const normalized = typeof value === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${normalized.replaceAll('"', '""')}"`;
  };
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = adminShellMessages[getActiveLocale()]["admin.shell.resource.unexpectedError"],
) {
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string; data?: Record<string, string> } };
      message?: string;
    };
    const fieldErrors = maybeAxiosError.response?.data?.data;
    if (fieldErrors && typeof fieldErrors === "object") {
      const first = Object.values(fieldErrors).find((value) => typeof value === "string");
      if (first) return first;
    }
    if (maybeAxiosError.response?.data?.message) return maybeAxiosError.response.data.message;
    if (maybeAxiosError.message) return maybeAxiosError.message;
  }

  return fallbackMessage;
}
