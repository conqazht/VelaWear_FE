import { apiGet } from "./client";
import type {
  PublicSalesResult,
  SaleCampaign,
  SaleCampaignPhase,
  SaleCampaignType,
} from "./types";
import type { Locale } from "@/lib/i18n";

export type PublicSaleFilters = {
  type: SaleCampaignType;
  phase?: SaleCampaignPhase | SaleCampaignPhase[];
  locale?: Locale;
};

function normalizePublicSales(payload: PublicSalesResult): PublicSalesResult {
  return {
    serverTime: payload.serverTime ?? new Date().toISOString(),
    campaigns: payload.campaigns ?? [],
  };
}

export async function getPublicSales(
  filters: PublicSaleFilters,
): Promise<PublicSalesResult> {
  const searchParams = new URLSearchParams({ type: filters.type });
  if (filters.locale) searchParams.set("locale", filters.locale);
  const phases = Array.isArray(filters.phase)
    ? filters.phase
    : filters.phase
      ? [filters.phase]
      : [];

  phases.forEach((phase) => searchParams.append("phase", phase));

  const payload = await apiGet<PublicSalesResult>(
    `/sales?${searchParams.toString()}`,
  );

  return normalizePublicSales(payload);
}

export function getPublicSale(code: string, locale?: Locale) {
  return apiGet<SaleCampaign>(`/sales/${encodeURIComponent(code)}`, { locale });
}
