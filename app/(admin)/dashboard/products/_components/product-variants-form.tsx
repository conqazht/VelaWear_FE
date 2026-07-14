"use client";

import { Plus, Trash2 } from "lucide-react";

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

const VARIANT_STATUSES: Array<{ value: ProductVariantStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

export function ProductVariantsForm({
  variants,
  onChange,
  colors,
  sizes,
  isCatalogLoading = false,
  catalogError,
}: ProductVariantsFormProps) {
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
          <h3 className="font-medium text-base">Product variants & inventory</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Add every sellable SKU with its color, size, price, and available stock.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus /> Add variant
        </Button>
      </div>

      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>Variant options unavailable</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <section key={variant.key} className="rounded-lg border bg-muted/10 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Variant {index + 1}</p>
                {variant.id ? <p className="text-muted-foreground text-xs">ID #{variant.id}</p> : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove variant ${index + 1}`}
                disabled={variants.length === 1}
                onClick={() => removeVariant(index)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor={`variant-${variant.key}-sku`}>SKU</FieldLabel>
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
                <FieldLabel htmlFor={`variant-${variant.key}-color`}>Color</FieldLabel>
                <Select
                  value={variant.colorId || NONE}
                  onValueChange={(value) => updateVariant(index, "colorId", value === NONE ? "" : (value ?? ""))}
                  disabled={isCatalogLoading}
                >
                  <SelectTrigger id={`variant-${variant.key}-color`} className="w-full">
                    <SelectValue placeholder="No color" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value={NONE}>No color</SelectItem>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={String(color.id)}>
                        {color.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-size`}>Size</FieldLabel>
                <Select
                  value={variant.sizeId || NONE}
                  onValueChange={(value) => updateVariant(index, "sizeId", value === NONE ? "" : (value ?? ""))}
                  disabled={isCatalogLoading}
                >
                  <SelectTrigger id={`variant-${variant.key}-size`} className="w-full">
                    <SelectValue placeholder="No size" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value={NONE}>No size</SelectItem>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={String(size.id)}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-price`}>Price</FieldLabel>
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
                <FieldLabel htmlFor={`variant-${variant.key}-sale-price`}>Sale price</FieldLabel>
                <Input
                  id={`variant-${variant.key}-sale-price`}
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="decimal"
                  value={variant.salePrice}
                  onChange={(event) => updateVariant(index, "salePrice", event.target.value)}
                  placeholder="Optional"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`variant-${variant.key}-stock`}>Stock</FieldLabel>
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
                <FieldLabel htmlFor={`variant-${variant.key}-status`}>Status</FieldLabel>
                <Select
                  value={variant.status}
                  onValueChange={(value) => updateVariant(index, "status", value as ProductVariantStatus)}
                >
                  <SelectTrigger id={`variant-${variant.key}-status`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {VARIANT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
        Color and size are optional for one-size products. SKU must be unique across the catalog.
      </FieldDescription>
    </div>
  );
}
