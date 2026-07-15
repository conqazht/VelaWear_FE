import type {
  AdminSaleCampaign,
  AdminSaleCampaignItem,
  CreateAdminSaleCampaignRequest,
  SaleCampaignPhase,
  SaleCampaignType,
  UpdateAdminSaleCampaignRequest,
} from "@/lib/api/admin-sales";
import type { AdminProductVariant } from "@/lib/api/admin-commerce";

export type SaleCampaignFormItem = {
  id?: number;
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  colorName: string | null;
  sizeName: string | null;
  referencePrice: number;
  promotionalPrice: string;
  quota: string;
  reservedQuantity: number;
  soldQuantity: number;
  maxPerCustomer: string;
};

export type SaleCampaignFormValues = {
  code: string;
  name: string;
  description: string;
  bannerUrl: string;
  type: SaleCampaignType;
  startsAt: string;
  endsAt: string;
  items: SaleCampaignFormItem[];
};

export type SaleCampaignValidationResult =
  | { valid: true }
  | { valid: false; step: 1 | 2; message: string };

export function toLocalDateTimeInput(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function createEmptySaleCampaignForm(): SaleCampaignFormValues {
  const startsAt = new Date();
  startsAt.setMinutes(startsAt.getMinutes() + 5, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 7);

  return {
    code: "",
    name: "",
    description: "",
    bannerUrl: "",
    type: "STANDARD",
    startsAt: toLocalDateTimeInput(startsAt),
    endsAt: toLocalDateTimeInput(endsAt),
    items: [],
  };
}

function campaignItemToFormItem(
  item: AdminSaleCampaignItem,
): SaleCampaignFormItem {
  return {
    id: item.id,
    variantId: item.variantId,
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    colorName: item.color,
    sizeName: item.size,
    referencePrice: item.referencePrice,
    promotionalPrice: String(item.promotionalPrice),
    quota: item.quota === null ? "" : String(item.quota),
    reservedQuantity: item.reservedQuantity,
    soldQuantity: item.soldQuantity,
    maxPerCustomer:
      item.maxPerCustomer === null ? "" : String(item.maxPerCustomer),
  };
}

export function saleCampaignToFormValues(
  campaign: AdminSaleCampaign,
): SaleCampaignFormValues {
  return {
    code: campaign.code,
    name: campaign.name,
    description: campaign.description ?? "",
    bannerUrl: campaign.bannerUrl ?? "",
    type: campaign.type,
    startsAt: toLocalDateTimeInput(campaign.startsAt),
    endsAt: toLocalDateTimeInput(campaign.endsAt),
    items: (campaign.items ?? []).map(campaignItemToFormItem),
  };
}

export function productVariantToFormItem(
  variant: AdminProductVariant,
  type: SaleCampaignType,
): SaleCampaignFormItem {
  const defaultSalePrice = Math.max(
    1,
    Math.floor((variant.price * 0.9) / 1_000) * 1_000,
  );

  return {
    variantId: variant.id,
    productId: variant.product.id,
    productName: variant.product.name,
    sku: variant.sku,
    colorName: variant.color?.name ?? null,
    sizeName: variant.size?.name ?? null,
    referencePrice: variant.price,
    promotionalPrice: String(defaultSalePrice),
    quota: type === "FLASH" ? "1" : "",
    reservedQuantity: 0,
    soldQuantity: 0,
    maxPerCustomer: "",
  };
}

export function getSaleCampaignPhase(
  campaign: Pick<AdminSaleCampaign, "phase" | "startsAt" | "endsAt">,
  now = Date.now(),
): SaleCampaignPhase {
  if (campaign.phase) return campaign.phase;
  const startsAt = new Date(campaign.startsAt).getTime();
  const endsAt = new Date(campaign.endsAt).getTime();
  if (now < startsAt) return "UPCOMING";
  if (now >= endsAt) return "ENDED";
  return "LIVE";
}

export function validateSaleCampaignForm(
  values: SaleCampaignFormValues,
  options: { displayOnly?: boolean } = {},
): SaleCampaignValidationResult {
  if (!values.name.trim()) {
    return { valid: false, step: 1, message: "Enter a campaign name." };
  }
  if (values.bannerUrl.trim()) {
    try {
      const url = new URL(values.bannerUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported URL protocol");
      }
    } catch {
      return {
        valid: false,
        step: 1,
        message: "Banner URL must be a valid http or https URL.",
      };
    }
  }
  if (options.displayOnly) return { valid: true };

  const code = values.code.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(code)) {
    return {
      valid: false,
      step: 1,
      message:
        "Campaign code must contain 3–50 uppercase letters, numbers, dashes, or underscores.",
    };
  }

  const startsAt = new Date(values.startsAt);
  const endsAt = new Date(values.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { valid: false, step: 1, message: "Choose a valid schedule." };
  }
  if (endsAt <= startsAt) {
    return {
      valid: false,
      step: 1,
      message: "End time must be later than start time.",
    };
  }
  if (values.items.length === 0) {
    return {
      valid: false,
      step: 2,
      message: "Select at least one product variant.",
    };
  }

  const variantIds = new Set<number>();
  for (const item of values.items) {
    if (variantIds.has(item.variantId)) {
      return {
        valid: false,
        step: 2,
        message: `Variant ${item.sku} is selected more than once.`,
      };
    }
    variantIds.add(item.variantId);

    const promotionalPrice = Number(item.promotionalPrice);
    if (
      !Number.isFinite(promotionalPrice) ||
      promotionalPrice <= 0 ||
      promotionalPrice >= item.referencePrice
    ) {
      return {
        valid: false,
        step: 2,
        message: `${item.sku} needs a sale price above 0 and below its reference price.`,
      };
    }

    if (values.type === "FLASH") {
      const quota = Number(item.quota);
      if (!Number.isInteger(quota) || quota <= 0) {
        return {
          valid: false,
          step: 2,
          message: `${item.sku} needs a positive whole-number quota.`,
        };
      }
      if (quota < item.reservedQuantity + item.soldQuantity) {
        return {
          valid: false,
          step: 2,
          message: `${item.sku} quota cannot be lower than its reserved and sold quantity.`,
        };
      }

      if (item.maxPerCustomer.trim()) {
        const maxPerCustomer = Number(item.maxPerCustomer);
        if (
          !Number.isInteger(maxPerCustomer) ||
          maxPerCustomer <= 0 ||
          maxPerCustomer > quota
        ) {
          return {
            valid: false,
            step: 2,
            message: `${item.sku} customer limit must be between 1 and its quota.`,
          };
        }
      }
    }
  }

  return { valid: true };
}

export function toCreateSaleCampaignRequest(
  values: SaleCampaignFormValues,
): CreateAdminSaleCampaignRequest {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    bannerUrl: values.bannerUrl.trim() || null,
    type: values.type,
    startsAt: new Date(values.startsAt).toISOString(),
    endsAt: new Date(values.endsAt).toISOString(),
    items: values.items.map((item) => ({
      variantId: item.variantId,
      promotionalPrice: Number(item.promotionalPrice),
      quota: values.type === "FLASH" ? Number(item.quota) : null,
      maxPerCustomer:
        values.type === "FLASH" && item.maxPerCustomer.trim()
          ? Number(item.maxPerCustomer)
          : null,
    })),
  };
}

export function toUpdateSaleCampaignRequest(
  values: SaleCampaignFormValues,
  version: number,
): UpdateAdminSaleCampaignRequest {
  return {
    ...toCreateSaleCampaignRequest(values),
    version,
  };
}
