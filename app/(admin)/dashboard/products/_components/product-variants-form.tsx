"use client";

import { Plus, Trash2 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminCatalogOption, ProductVariantStatus } from "@/lib/api/admin-commerce";

export type ProductVariantFormValue = {
  key: string;
  id?: number;
  sku: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  colorId: string;
  sizeId: string;
  status: ProductVariantStatus;
};

export function createEmptyProductVariant(key: string): ProductVariantFormValue {
  return {
    key,
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "0",
    colorId: "",
    sizeId: "",
    status: "OUT_OF_STOCK",
  };
}

type ProductVariantsFormProps = {
  variants: ProductVariantFormValue[];
  onChange: (variants: ProductVariantFormValue[]) => void;
  colors: AdminCatalogOption[];
  sizes: AdminCatalogOption[];
  isCatalogLoading?: boolean;
  catalogError?: string | null;
};

const NONE = "NONE";

const VARIANT_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.products.status.active",
  INACTIVE: "admin.commerce.products.status.inactive",
  OUT_OF_STOCK: "admin.commerce.products.status.outOfStock",
  DISCONTINUED: "admin.commerce.products.variantStatus.discontinued",
} as const;

const VARIANT_STATUSES: ProductVariantStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
  "DISCONTINUED",
];

export function ProductVariantsForm({
  variants,
  onChange,
  colors,
  sizes,
  isCatalogLoading = false,
  catalogError,
}: ProductVariantsFormProps) {
  const { t } = useI18n();

  function updateVariant<Key extends keyof ProductVariantFormValue>(
    index: number,
    key: Key,
    value: ProductVariantFormValue[Key]
  ) {
    onChange(variants.map((variant, itemIndex) => (itemIndex === index ? { ...variant, [key]: value } : variant)));
  }

  function addVariant() {
    onChange([...variants, createEmptyProductVariant(`new-${Date.now()}-${variants.length}`)]);
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateStock(index: number, value: string) {
    const stock = Number(value);
    onChange(
      variants.map((variant, itemIndex) => {
        if (itemIndex !== index) return variant;
        let status = variant.status;
        if (Number.isInteger(stock) && stock >= 0) {
          if (stock === 0 && status === "ACTIVE") status = "OUT_OF_STOCK";
          if (stock > 0 && status === "OUT_OF_STOCK") status = "ACTIVE";
        }
        return { ...variant, stockQuantity: value, status };
      })
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-medium text-base">
            {t("admin.commerce.products.variants.title")}
          </h3>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("admin.commerce.products.variants.description")}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus /> {t("admin.commerce.products.variants.add")}
        </Button>
      </div>

      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.products.variants.unavailable")}</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <section key={variant.key} className="rounded-lg border bg-muted/10 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">
                  {t("admin.commerce.products.variants.label", { number: index + 1 })}
                </p>
                {variant.id ? (
                  <p className="text-muted-foreground text-xs">
                    {t("admin.commerce.products.variants.id", { id: variant.id })}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("admin.commerce.products.variants.remove", { number: index + 1 })}
                disabled={variants.length === 1}
                onClick={() => removeVariant(index)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor={`variant-${variant.key}-sku`}>
                  {t("admin.commerce.products.variants.sku")}
                </FieldLabel>
                <Input
                  id={`variant-${variant.key}-sku`}
                  value={variant.sku}
                  onChange={(event) => updateVariant(index, "sku", event.target.value)}
                  maxLength={100}
                  placeholder="VELA-BLAZER-BLK-M"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-color`}>
                  {t("admin.commerce.products.variants.color")}
                </FieldLabel>
                <Select
                  value={variant.colorId || NONE}
                  onValueChange={(value) => updateVariant(index, "colorId", value === NONE ? "" : (value ?? ""))}
                  disabled={isCatalogLoading}
                >
                  <SelectTrigger id={`variant-${variant.key}-color`} className="w-full">
                    <SelectValue placeholder={t("admin.commerce.products.variants.noColor")} />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value={NONE}>
                      {t("admin.commerce.products.variants.noColor")}
                    </SelectItem>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={String(color.id)}>
                        {color.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-size`}>
                  {t("admin.commerce.products.variants.size")}
                </FieldLabel>
                <Select
                  value={variant.sizeId || NONE}
                  onValueChange={(value) => updateVariant(index, "sizeId", value === NONE ? "" : (value ?? ""))}
                  disabled={isCatalogLoading}
                >
                  <SelectTrigger id={`variant-${variant.key}-size`} className="w-full">
                    <SelectValue placeholder={t("admin.commerce.products.variants.noSize")} />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value={NONE}>
                      {t("admin.commerce.products.variants.noSize")}
                    </SelectItem>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={String(size.id)}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-price`}>
                  {t("admin.commerce.products.variants.price")}
                </FieldLabel>
                <Input
                  id={`variant-${variant.key}-price`}
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="decimal"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, "price", event.target.value)}
                  placeholder="0"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-sale-price`}>
                  {t("admin.commerce.products.variants.salePrice")}
                </FieldLabel>
                <Input
                  id={`variant-${variant.key}-sale-price`}
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="decimal"
                  value={variant.salePrice}
                  onChange={(event) => updateVariant(index, "salePrice", event.target.value)}
                  placeholder={t("admin.commerce.products.variants.optional")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-stock`}>
                  {t("admin.commerce.products.variants.stock")}
                </FieldLabel>
                <Input
                  id={`variant-${variant.key}-stock`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={variant.stockQuantity}
                  onChange={(event) => updateStock(index, event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-status`}>
                  {t("admin.commerce.products.variants.status")}
                </FieldLabel>
                <Select
                  value={variant.status}
                  onValueChange={(value) => updateVariant(index, "status", value as ProductVariantStatus)}
                >
                  <SelectTrigger id={`variant-${variant.key}-status`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {VARIANT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(VARIANT_STATUS_MESSAGE_KEYS[status])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>
        ))}
      </div>

      <FieldDescription>
        {t("admin.commerce.products.variants.help")}
      </FieldDescription>
    </div>
  );
}
