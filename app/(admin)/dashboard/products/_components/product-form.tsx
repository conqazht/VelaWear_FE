"use client";

import { useI18n } from "@/components/providers/i18n-provider";
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

const PRODUCT_STATUS_MESSAGE_KEYS = {
  DRAFT: "admin.commerce.products.status.draft",
  ACTIVE: "admin.commerce.products.status.active",
  INACTIVE: "admin.commerce.products.status.inactive",
  OUT_OF_STOCK: "admin.commerce.products.status.outOfStock",
} as const;

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"];

export function ProductForm({
  values,
  onChange,
  categories,
  brands,
  isEditing,
  isCatalogLoading = false,
  catalogError,
}: ProductFormProps) {
  const { t } = useI18n();

  function update<Key extends keyof ProductFormValues>(key: Key, value: ProductFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.products.form.catalogUnavailable")}</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="product-category">
            {t("admin.commerce.products.form.category")}
          </FieldLabel>
          <Select
            value={values.categoryId || null}
            onValueChange={(value) => update("categoryId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-category" className="w-full">
              <SelectValue
                placeholder={
                  isCatalogLoading
                    ? t("admin.commerce.products.form.loadingCategories")
                    : t("admin.commerce.products.form.selectCategory")
                }
              />
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
          <FieldLabel htmlFor="product-brand">
            {t("admin.commerce.products.form.brand")}
          </FieldLabel>
          <Select
            value={values.brandId || null}
            onValueChange={(value) => update("brandId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-brand" className="w-full">
              <SelectValue
                placeholder={
                  isCatalogLoading
                    ? t("admin.commerce.products.form.loadingBrands")
                    : t("admin.commerce.products.form.selectBrand")
                }
              />
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
        <FieldLabel htmlFor="product-name">{t("admin.commerce.products.form.name")}</FieldLabel>
        <Input
          id="product-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={255}
          placeholder={t("admin.commerce.products.form.namePlaceholder")}
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="product-slug">{t("admin.commerce.products.form.slug")}</FieldLabel>
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
            ? t("admin.commerce.products.form.slugImmutable")
            : t("admin.commerce.products.form.slugHelp")}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="product-description">
          {t("admin.commerce.products.form.description")}
        </FieldLabel>
        <Textarea
          id="product-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder={t("admin.commerce.products.form.descriptionPlaceholder")}
          rows={6}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="product-status">
          {t("admin.commerce.products.form.status")}
        </FieldLabel>
        <Select value={values.status} onValueChange={(value) => update("status", value as ProductStatus)}>
          <SelectTrigger id="product-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(PRODUCT_STATUS_MESSAGE_KEYS[status])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          {t("admin.commerce.products.form.statusHelp")}
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
