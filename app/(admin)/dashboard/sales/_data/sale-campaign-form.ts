import type {
  AdminSaleCampaign,
  AdminSaleCampaignItem,
  CreateAdminSaleCampaignRequest,
  SaleCampaignPhase,
  SaleCampaignTranslation,
  SaleCampaignType,
  UpdateAdminSaleCampaignRequest,
} from "@/lib/api/admin-sales";
import type { AdminProductVariant } from "@/lib/api/admin-commerce";
import {
  interpolateMessage,
  type MessageVariables,
} from "@/lib/i18n/define-messages";
import {
  salesAdminManagementMessages,
  type SalesAdminManagementTranslationKey,
} from "@/lib/i18n/messages/sales-admin-management";

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
  englishName: string;
  englishDescription: string;
  bannerUrl: string;
  type: SaleCampaignType;
  startsAt: string;
  endsAt: string;
  items: SaleCampaignFormItem[];
};

export type SaleCampaignValidationResult =
  | { valid: true }
  | { valid: false; step: 1 | 2; message: string };

export type SaleCampaignFormTranslator = (
  key: SalesAdminManagementTranslationKey,
  variables?: MessageVariables,
) => string;

function defaultFormTranslator(
  key: SalesAdminManagementTranslationKey,
  variables?: MessageVariables,
) {
  return interpolateMessage(salesAdminManagementMessages.en[key], variables);
}

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
    englishName: "",
    englishDescription: "",
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
  translations: SaleCampaignTranslation[] = [],
): SaleCampaignFormValues {
  const byLocale = new Map(translations.map((translation) => [translation.localeCode, translation]));
  const vi = byLocale.get("vi");
  const en = byLocale.get("en");
  return {
    code: campaign.code,
    name: vi?.name ?? campaign.name,
    description: vi?.description ?? campaign.description ?? "",
    englishName: en?.name ?? "",
    englishDescription: en?.description ?? "",
    bannerUrl: campaign.bannerUrl ?? "",
    type: campaign.type,
    startsAt: toLocalDateTimeInput(campaign.startsAt),
    endsAt: toLocalDateTimeInput(campaign.endsAt),
    items: (campaign.items ?? []).map(campaignItemToFormItem),
  };
}

export function serializeSaleCampaignTranslations(
  values: Pick<
    SaleCampaignFormValues,
    "name" | "description" | "englishName" | "englishDescription"
  >,
): SaleCampaignTranslation[] {
  const translations: SaleCampaignTranslation[] = [
    {
      localeCode: "vi",
      name: values.name.trim(),
      description: values.description.trim() || null,
    },
  ];
  if (values.englishName.trim()) {
    translations.push({
      localeCode: "en",
      name: values.englishName.trim(),
      description: values.englishDescription.trim() || null,
    });
  }
  return translations;
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
  options: { displayOnly?: boolean; t?: SaleCampaignFormTranslator } = {},
): SaleCampaignValidationResult {
  const t = options.t ?? defaultFormTranslator;

  if (!values.name.trim()) {
    return {
      valid: false,
      step: 1,
      message: t("admin.sales.management.validation.nameRequired"),
    };
  }
  if (values.englishDescription.trim() && !values.englishName.trim()) {
    return {
      valid: false,
      step: 1,
      message: t("admin.sales.management.validation.englishPartial"),
    };
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
        message: t("admin.sales.management.validation.bannerUrl"),
      };
    }
  }
  if (options.displayOnly) return { valid: true };

  const code = values.code.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(code)) {
    return {
      valid: false,
      step: 1,
      message: t("admin.sales.management.validation.code"),
    };
  }

  const startsAt = new Date(values.startsAt);
  const endsAt = new Date(values.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return {
      valid: false,
      step: 1,
      message: t("admin.sales.management.validation.schedule"),
    };
  }
  if (endsAt <= startsAt) {
    return {
      valid: false,
      step: 1,
      message: t("admin.sales.management.validation.scheduleOrder"),
    };
  }
  if (values.items.length === 0) {
    return {
      valid: false,
      step: 2,
      message: t("admin.sales.management.validation.itemRequired"),
    };
  }

  const variantIds = new Set<number>();
  for (const item of values.items) {
    if (variantIds.has(item.variantId)) {
      return {
        valid: false,
        step: 2,
        message: t("admin.sales.management.validation.duplicateVariant", {
          sku: item.sku,
        }),
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
        message: t("admin.sales.management.validation.salePrice", {
          sku: item.sku,
        }),
      };
    }

    if (values.type === "FLASH") {
      const quota = Number(item.quota);
      if (!Number.isInteger(quota) || quota <= 0) {
        return {
          valid: false,
          step: 2,
          message: t("admin.sales.management.validation.quotaPositive", {
            sku: item.sku,
          }),
        };
      }
      if (quota < item.reservedQuantity + item.soldQuantity) {
        return {
          valid: false,
          step: 2,
          message: t("admin.sales.management.validation.quotaUsed", {
            sku: item.sku,
          }),
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
            message: t("admin.sales.management.validation.customerLimit", {
              sku: item.sku,
            }),
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

type SaveSaleCampaignWithTranslationsOptions = {
  campaign?: AdminSaleCampaign;
  values: SaleCampaignFormValues;
  createCampaign: (
    request: CreateAdminSaleCampaignRequest,
  ) => Promise<AdminSaleCampaign>;
  updateCampaign: (input: {
    id: number;
    request: UpdateAdminSaleCampaignRequest;
  }) => Promise<AdminSaleCampaign>;
  saveTranslations: (campaign: AdminSaleCampaign) => Promise<AdminSaleCampaign>;
  onBasePersisted: (campaign: AdminSaleCampaign) => void;
};

export async function saveSaleCampaignWithTranslations({
  campaign,
  values,
  createCampaign,
  updateCampaign,
  saveTranslations,
  onBasePersisted,
}: SaveSaleCampaignWithTranslationsOptions) {
  const baseCampaign = campaign
    ? await updateCampaign({
        id: campaign.id,
        request: toUpdateSaleCampaignRequest(values, campaign.version),
      })
    : await createCampaign(toCreateSaleCampaignRequest(values));

  // Persist this checkpoint before translation I/O so a retry updates the same campaign.
  onBasePersisted(baseCampaign);
  const savedCampaign = await saveTranslations(baseCampaign);
  onBasePersisted(savedCampaign);
  return savedCampaign;
}
