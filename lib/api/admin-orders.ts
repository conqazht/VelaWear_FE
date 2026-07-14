import { apiGet, apiPut } from "./client";
import type { ResultPaginationDTO } from "./types";

export const ADMIN_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const ADMIN_PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];
export type AdminPaymentStatus = (typeof ADMIN_PAYMENT_STATUSES)[number];

export type AdminOrderItem = {
  id: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  status: string;
  createdAt?: string;
};

export type AdminOrder = {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  orderCode: string;
  status: AdminOrderStatus;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: string;
  paymentStatus: AdminPaymentStatus;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
};

export type AdminOrderStatusHistory = {
  id: number;
  orderId: number;
  fromStatus: AdminOrderStatus | null;
  toStatus: AdminOrderStatus;
  changedBy: number | null;
  reason: string | null;
  createdAt: string;
};

export type AdminOrderFilters = {
  page?: number;
  size?: number;
  sort?: string;
  userId?: number;
  orderCode?: string;
  status?: AdminOrderStatus;
  paymentMethod?: string;
  paymentStatus?: AdminPaymentStatus;
  receiverName?: string;
  receiverPhone?: string;
  finalAmountFrom?: number;
  finalAmountTo?: number;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type AdminOrderStatusHistoryFilters = {
  page?: number;
  size?: number;
  sort?: string;
  fromStatus?: AdminOrderStatus;
  toStatus?: AdminOrderStatus;
  changedBy?: number;
  reason?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type UpdateAdminOrderRequest = {
  status?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
};

export function getAdminOrders(filters: AdminOrderFilters = {}) {
  return apiGet<ResultPaginationDTO<AdminOrder>>("/orders", filters);
}

export function getAdminOrder(id: number) {
  return apiGet<AdminOrder>(`/orders/${id}`);
}

export function getAdminOrderStatusHistories(
  id: number,
  filters: AdminOrderStatusHistoryFilters = {},
) {
  return apiGet<ResultPaginationDTO<AdminOrderStatusHistory>>(
    `/orders/${id}/status-histories`,
    filters,
  );
}

export function updateAdminOrder(id: number, request: UpdateAdminOrderRequest) {
  return apiPut<AdminOrder, UpdateAdminOrderRequest>(`/orders/${id}`, request);
}
