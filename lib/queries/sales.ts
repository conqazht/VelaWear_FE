"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getPublicSale,
  getPublicSales,
  type PublicSaleFilters,
} from "@/lib/api/sales";

export const saleQueryKeys = {
  root: ["sales"] as const,
  list: (filters: PublicSaleFilters) => ["sales", "list", filters] as const,
  detail: (code: string) => ["sales", "detail", code] as const,
};

export function usePublicSalesQuery(filters: PublicSaleFilters) {
  const isFlash = filters.type === "FLASH";

  return useQuery({
    queryKey: saleQueryKeys.list(filters),
    queryFn: () => getPublicSales(filters),
    placeholderData: keepPreviousData,
    staleTime: isFlash ? 5_000 : 30_000,
    refetchInterval: isFlash ? 15_000 : 60_000,
    refetchOnWindowFocus: true,
  });
}

export function usePublicSaleQuery(code?: string) {
  return useQuery({
    queryKey: saleQueryKeys.detail(code ?? ""),
    queryFn: () => getPublicSale(code as string),
    enabled: Boolean(code),
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}
