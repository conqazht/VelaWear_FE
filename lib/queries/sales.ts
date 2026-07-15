"use client";

import { useQuery } from "@tanstack/react-query";

import { useI18n } from "@/components/providers/i18n-provider";

import {
  getPublicSale,
  getPublicSales,
  type PublicSaleFilters,
} from "@/lib/api/sales";

export const saleQueryKeys = {
  root: ["sales"] as const,
  list: (filters: PublicSaleFilters) => ["sales", "list", filters] as const,
  detail: (code: string, locale?: string) => ["sales", "detail", code, locale] as const,
};

export function usePublicSalesQuery(filters: PublicSaleFilters) {
  const { locale } = useI18n();
  const resolvedFilters = { ...filters, locale: filters.locale ?? locale };
  const isFlash = resolvedFilters.type === "FLASH";

  return useQuery({
    queryKey: saleQueryKeys.list(resolvedFilters),
    queryFn: () => getPublicSales(resolvedFilters),
    staleTime: isFlash ? 5_000 : 30_000,
    refetchInterval: isFlash ? 15_000 : 60_000,
    refetchOnWindowFocus: true,
  });
}

export function usePublicSaleQuery(code?: string) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: saleQueryKeys.detail(code ?? "", locale),
    queryFn: () => getPublicSale(code as string, locale),
    enabled: Boolean(code),
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}
