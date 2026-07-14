"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminOrder,
  getAdminOrders,
  getAdminOrderStatusHistories,
  updateAdminOrder,
  type AdminOrderFilters,
  type AdminOrderStatusHistoryFilters,
  type UpdateAdminOrderRequest,
} from "@/lib/api/admin-orders";

export const adminOrderQueryKeys = {
  root: ["admin", "orders"] as const,
  list: (filters: AdminOrderFilters) => ["admin", "orders", "list", filters] as const,
  detail: (id: number) => ["admin", "orders", "detail", id] as const,
  histories: (id: number, filters: AdminOrderStatusHistoryFilters) =>
    ["admin", "orders", "detail", id, "status-histories", filters] as const,
};

export function useAdminOrdersQuery(filters: AdminOrderFilters, enabled = true) {
  return useQuery({
    queryKey: adminOrderQueryKeys.list(filters),
    queryFn: () => getAdminOrders(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useAdminOrderQuery(id?: number, enabled = true) {
  return useQuery({
    queryKey: adminOrderQueryKeys.detail(id ?? 0),
    queryFn: () => getAdminOrder(id as number),
    enabled: enabled && typeof id === "number",
  });
}

export function useAdminOrderStatusHistoriesQuery(
  id: number | undefined,
  filters: AdminOrderStatusHistoryFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: adminOrderQueryKeys.histories(id ?? 0, filters),
    queryFn: () => getAdminOrderStatusHistories(id as number, filters),
    enabled: enabled && typeof id === "number",
  });
}

export function useUpdateAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminOrderRequest }) =>
      updateAdminOrder(id, request),
    onSuccess: async (order) => {
      queryClient.setQueryData(adminOrderQueryKeys.detail(order.id), order);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminOrderQueryKeys.root }),
        queryClient.invalidateQueries({ queryKey: adminOrderQueryKeys.detail(order.id) }),
      ]);
    },
  });
}
