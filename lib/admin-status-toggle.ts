import type {
  AdminCatalogStatus,
  ProductStatus,
  ProductVariantStatus,
} from "@/lib/api/admin-commerce";

export type StatusToggleState = {
  checked: boolean;
  disabled: boolean;
};

export function getProductStatusToggleState(status: ProductStatus): StatusToggleState {
  return {
    checked: status === "ACTIVE",
    disabled: status === "OUT_OF_STOCK",
  };
}

export function getProductStatusToggleTarget(
  status: ProductStatus,
  checked: boolean,
): ProductStatus | null {
  if (status === "OUT_OF_STOCK") return null;
  return checked ? "ACTIVE" : "INACTIVE";
}

export function getCatalogStatusToggleTarget(checked: boolean): AdminCatalogStatus {
  return checked ? "ACTIVE" : "INACTIVE";
}

export function getVariantStatusToggleState(status: ProductVariantStatus): StatusToggleState {
  return {
    checked: status === "ACTIVE",
    disabled: status === "OUT_OF_STOCK" || status === "DISCONTINUED",
  };
}

export function getVariantStatusToggleTarget(
  status: ProductVariantStatus,
  checked: boolean,
): "ACTIVE" | "INACTIVE" | null {
  if (status === "OUT_OF_STOCK" || status === "DISCONTINUED") return null;
  return checked ? "ACTIVE" : "INACTIVE";
}
