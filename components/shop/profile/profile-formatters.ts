import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/format";
import type { UserAddress } from "@/lib/api/types";

export const profileTabIds = ["profile", "orders", "favourites", "coupons", "reviews"] as const;
export type ProfileTabId = (typeof profileTabIds)[number];

export const getProfileTabId = (tab: string | null): ProfileTabId =>
  profileTabIds.includes(tab as ProfileTabId) ? (tab as ProfileTabId) : "profile";

export const formatDisplayDate = (value: string | null | undefined, locale: Locale) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDate(date, locale);
};

export const formatMemberSince = (value: string | null | undefined, locale: Locale) => {
  if (!value) return formatDate("2026-06-01", locale, { month: "long", year: "numeric" });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate("2026-06-01", locale, { month: "long", year: "numeric" });
  return formatDate(date, locale, { month: "long", year: "numeric" });
};

export const formatAddress = (address: UserAddress) =>
  [
    address.addressDetail,
    address.ward,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

export const orderStatusMeta: Record<string, { badge: string; dot: string }> = {
  PENDING: {
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    badge: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
  },
  SHIPPING: {
    badge: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  COMPLETED: {
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    badge: "bg-violet-100 text-violet-800",
    dot: "bg-violet-500",
  },
};

export const orderStatusLabelKeys = {
  PENDING: "account.orders.status.pending",
  CONFIRMED: "account.orders.status.confirmed",
  SHIPPING: "account.orders.status.shipping",
  COMPLETED: "account.orders.status.completed",
  CANCELLED: "account.orders.status.cancelled",
  REFUNDED: "account.orders.status.refunded",
} as const;
