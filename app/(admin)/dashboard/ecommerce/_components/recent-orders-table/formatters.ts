import type React from "react";

import type { OrderFilter } from "./schema";

export function formatOrderCount(filter: OrderFilter, count: number) {
  const orderLabel = count === 1 ? "order" : "orders";

  if (filter === "ALL") {
    return `${count.toLocaleString()} ${orderLabel}`;
  }

  if (filter === "PENDING") {
    return `${count.toLocaleString()} pending ${orderLabel}`;
  }

  return `${count.toLocaleString()} ${filter.toLowerCase()} ${orderLabel}`;
}

export function formatSelectedOrderCount(count: number) {
  const orderLabel = count === 1 ? "order" : "orders";

  return `${count.toLocaleString()} ${orderLabel} selected`;
}

export function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}
