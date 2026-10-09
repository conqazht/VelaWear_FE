import { useQuery } from "@tanstack/react-query";

import {
  getAdminCrmDashboard,
  getAdminEcommerceDashboard,
  getAdminFinanceDashboard,
  type AdminDashboardPeriod,
  type CrmDashboardResponse,
  type EcommerceDashboardResponse,
  type FinanceDashboardResponse,
} from "@/lib/api/admin-dashboard";
import { queryKeys } from "./keys";

export function useAdminEcommerceDashboardQuery(
  period: AdminDashboardPeriod = "this-month",
  enabled = true,
) {
  return useQuery<EcommerceDashboardResponse>({
    queryKey: queryKeys.adminDashboard.ecommerce(period),
    queryFn: () => getAdminEcommerceDashboard(period),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useAdminFinanceDashboardQuery(
  period: AdminDashboardPeriod = "this-month",
  enabled = true,
) {
  return useQuery<FinanceDashboardResponse>({
    queryKey: queryKeys.adminDashboard.finance(period),
    queryFn: () => getAdminFinanceDashboard(period),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useAdminCrmDashboardQuery(
  period: AdminDashboardPeriod = "this-month",
  enabled = true,
) {
  return useQuery<CrmDashboardResponse>({
    queryKey: queryKeys.adminDashboard.crm(period),
    queryFn: () => getAdminCrmDashboard(period),
    enabled,
    staleTime: 60 * 1000,
  });
}
