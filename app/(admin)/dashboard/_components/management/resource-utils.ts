export { getApiErrorStatus } from "@/lib/api/errors";

export function formatAdminDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export function formatAdminDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function resolveAdminAssetUrl(value?: string | null) {
  if (!value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value ?? undefined;
  }

  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const cleanPath = value.startsWith("/") ? value : `/${value}`;

    try {
      return `${new URL(apiUrl).origin}${cleanPath}`;
    } catch {
      return `http://localhost:8080${cleanPath}`;
    }
  }

  return value;
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null | undefined) => {
    const raw = value === null || value === undefined ? "" : String(value);
    const normalized = typeof value === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${normalized.replaceAll('"', '""')}"`;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getApiErrorMessage(error: unknown) {
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

  return "An unexpected error occurred. Please try again.";
}
