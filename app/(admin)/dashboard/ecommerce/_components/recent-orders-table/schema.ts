import type { RecentOrderSummary } from "@/lib/api/admin-dashboard";

export const orderFilters = ["ALL", "PENDING", "SHIPPING", "COMPLETED", "CANCELLED"] as const;

export type OrderFilter = (typeof orderFilters)[number];

export type OrderRow = RecentOrderSummary;
