"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCatalogOption, ProductStatus } from "@/lib/api/admin-commerce";

export type ProductFormValues = {
  categoryId: string;
  brandId: string;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  categoryId: "",
  brandId: "",
  name: "",
  slug: "",
  description: "",
  status: "DRAFT",
};

type ProductFormProps = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  categories: AdminCatalogOption[];
  brands: AdminCatalogOption[];
  isEditing: boolean;
  isCatalogLoading?: boolean;
  catalogError?: string | null;
};

const PRODUCT_STATUSES: Array<{ value: ProductStatus; label: string }> = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

export function ProductForm({
  values,
  onChange,
  categories,
  brands,
  isEditing,
  isCatalogLoading = false,
  catalogError,
}: ProductFormProps) {
  function update<Key extends keyof ProductFormValues>(key: Key, value: ProductFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>Catalog options unavailable</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="product-category">Category</FieldLabel>
          <Select
            value={values.categoryId || null}
            onValueChange={(value) => update("categoryId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-category" className="w-full">
              <SelectValue placeholder={isCatalogLoading ? "Loading categories..." : "Select category"} />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-brand">Brand</FieldLabel>
          <Select
            value={values.brandId || null}
            onValueChange={(value) => update("brandId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-brand" className="w-full">
              <SelectValue placeholder={isCatalogLoading ? "Loading brands..." : "Select brand"} />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="product-name">Product name</FieldLabel>
        <Input
          id="product-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={255}
          placeholder="e.g. Structured linen blazer"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
        <Input
          id="product-slug"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value.toLowerCase())}
          maxLength={280}
          placeholder="structured-linen-blazer"
          disabled={isEditing}
          required={!isEditing}
        />
        <FieldDescription>
          {isEditing
            ? "The backend treats a product slug as immutable after creation."
            : "Use a unique, URL-safe slug. It cannot be changed later."}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="product-description">Description</FieldLabel>
        <Textarea
          id="product-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Describe materials, fit, and product details."
          rows={6}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="product-status">Catalog status</FieldLabel>
        <Select value={values.status} onValueChange={(value) => update("status", value as ProductStatus)}>
          <SelectTrigger id="product-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          Product visibility is independent from each variant&apos;s stock and selling status.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
