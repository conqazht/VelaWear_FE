import type { SaleCampaignItem, SaleCampaignPhase, SaleCampaignStatus } from "@/lib/api/types";

export type CountdownParts = {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function deriveSalePhase(
  status: SaleCampaignStatus,
  startsAt: string,
  endsAt: string,
  now = Date.now(),
): SaleCampaignPhase {
  if (status === "CANCELLED" || now >= Date.parse(endsAt)) return "ENDED";
  if (now < Date.parse(startsAt)) return "UPCOMING";
  return "LIVE";
}

export function getCountdown(target: string, now = Date.now()): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((Date.parse(target) - now) / 1_000));

  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getServerClockOffset(serverTime?: string): number {
  if (!serverTime) return 0;
  const parsed = Date.parse(serverTime);
  return Number.isFinite(parsed) ? parsed - Date.now() : 0;
}

export type SaleProductGroup = {
  productId: number;
  productName: string;
  productSlug: string;
  image?: string | null;
  variants: SaleCampaignItem[];
  referencePrice: number;
  promotionalPrice: number;
  quota: number | null;
  remainingQuota: number | null;
  availableQuantity: number;
  maxPerCustomer: number | null;
};

export function groupSaleItems(items: SaleCampaignItem[]): SaleProductGroup[] {
  const grouped = new Map<number, SaleCampaignItem[]>();

  for (const item of items) {
    grouped.set(item.productId, [...(grouped.get(item.productId) ?? []), item]);
  }

  return Array.from(grouped.values()).map((variants) => {
    const representative = variants.reduce((best, current) =>
      current.promotionalPrice < best.promotionalPrice ? current : best,
    );
    const quotas = variants
      .map((item) => item.quota)
      .filter((value): value is number => value != null);
    const remaining = variants
      .map((item) => item.remainingQuota)
      .filter((value): value is number => value != null);
    const limits = variants
      .map((item) => item.maxPerCustomer)
      .filter((value): value is number => value != null);
    const availableQuantity = variants.reduce(
      (sum, item) => sum + Math.max(0, item.availableQuantity),
      0,
    );

    return {
      productId: representative.productId,
      productName: representative.productName,
      productSlug: representative.productSlug || String(representative.productId),
      image: representative.image,
      variants,
      referencePrice: representative.referencePrice,
      promotionalPrice: representative.promotionalPrice,
      quota: quotas.length > 0 ? quotas.reduce((sum, value) => sum + value, 0) : null,
      remainingQuota:
        remaining.length > 0 ? remaining.reduce((sum, value) => sum + value, 0) : null,
      availableQuantity,
      maxPerCustomer: limits.length > 0 ? Math.min(...limits) : null,
    };
  });
}
