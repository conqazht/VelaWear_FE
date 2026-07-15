"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminCatalogStatus, AdminCategory } from "@/lib/api/admin-commerce";

const ROOT_CATEGORY_VALUE = "ROOT";

export type CategoryFormValues = {
  parentId: string;
  name: string;
  slug: string;
  sortOrder: string;
  status: AdminCatalogStatus;
};

export const EMPTY_CATEGORY_FORM: CategoryFormValues = {
  parentId: "",
  name: "",
  slug: "",
  sortOrder: "0",
  status: "ACTIVE",
};

const CATEGORY_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

const CATEGORY_STATUSES: AdminCatalogStatus[] = ["ACTIVE", "INACTIVE"];

type CategoryFormProps = {
  values: CategoryFormValues;
  onChange: (next: CategoryFormValues) => void;
  categories: AdminCategory[];
  editingCategoryId: number | null;
  isCatalogLoading?: boolean;
  catalogError?: string | null;
};

export function CategoryForm({
  values,
  onChange,
  categories,
  editingCategoryId,
  isCatalogLoading = false,
  catalogError,
}: CategoryFormProps) {
  const { t } = useI18n();
  const isEditing = editingCategoryId !== null;
  const excludedParentIds = new Set<number>();
  if (editingCategoryId !== null) {
    excludedParentIds.add(editingCategoryId);
    let foundDescendant = true;
    while (foundDescendant) {
      foundDescendant = false;
      for (const category of categories) {
        if (
          category.parentId !== null &&
          excludedParentIds.has(category.parentId) &&
          !excludedParentIds.has(category.id)
        ) {
          excludedParentIds.add(category.id);
          foundDescendant = true;
        }
      }
    }
  }
  const parentOptions = categories.filter((category) => !excludedParentIds.has(category.id));

  function update<Key extends keyof CategoryFormValues>(key: Key, value: CategoryFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.categories.form.parentUnavailable")}</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <Field>
        <FieldLabel htmlFor="category-parent">
          {t("admin.commerce.categories.form.parent")}
        </FieldLabel>
        <Select
          value={values.parentId || ROOT_CATEGORY_VALUE}
          onValueChange={(value) =>
            update("parentId", value === ROOT_CATEGORY_VALUE ? "" : (value ?? ""))
          }
          disabled={isCatalogLoading}
        >
          <SelectTrigger id="category-parent" className="w-full">
            <SelectValue
              placeholder={
                isCatalogLoading
                  ? t("admin.commerce.categories.form.loading")
                  : t("admin.commerce.categories.topLevel")
              }
            />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ROOT_CATEGORY_VALUE}>
              {t("admin.commerce.categories.form.noParent")}
            </SelectItem>
            {parentOptions.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name} (/{category.originalSlug || category.slug})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          {isEditing
            ? t("admin.commerce.categories.form.editParentHelp")
            : t("admin.commerce.categories.form.createParentHelp")}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="category-name">{t("admin.commerce.categories.form.name")}</FieldLabel>
        <Input
          id="category-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={150}
          placeholder={t("admin.commerce.categories.form.namePlaceholder")}
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="category-slug">{t("admin.commerce.categories.form.slug")}</FieldLabel>
        <Input
          id="category-slug"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value.toLowerCase())}
          maxLength={180}
          placeholder="tailoring"
          spellCheck={false}
          disabled={isEditing}
          required={!isEditing}
        />
        <FieldDescription>
          {isEditing
            ? t("admin.commerce.categories.form.slugImmutable")
            : t("admin.commerce.categories.form.slugHelp")}
        </FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="category-sort-order">
            {t("admin.commerce.categories.form.sortOrder")}
          </FieldLabel>
          <Input
            id="category-sort-order"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={values.sortOrder}
            onChange={(event) => update("sortOrder", event.target.value)}
            required
          />
          <FieldDescription>{t("admin.commerce.categories.form.sortOrderHelp")}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="category-status">{t("admin.commerce.common.status")}</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(value) => update("status", value as AdminCatalogStatus)}
          >
            <SelectTrigger id="category-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {CATEGORY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(CATEGORY_STATUS_MESSAGE_KEYS[status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{t("admin.commerce.categories.form.statusHelp")}</FieldDescription>
        </Field>
      </div>
    </FieldGroup>
  );
}
