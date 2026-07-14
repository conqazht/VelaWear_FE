"use client";

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

const CATEGORY_STATUSES: Array<{ value: AdminCatalogStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

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
          <AlertTitle>Parent categories unavailable</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <Field>
        <FieldLabel htmlFor="category-parent">Parent category</FieldLabel>
        <Select
          value={values.parentId || ROOT_CATEGORY_VALUE}
          onValueChange={(value) =>
            update("parentId", value === ROOT_CATEGORY_VALUE ? "" : (value ?? ""))
          }
          disabled={isCatalogLoading}
        >
          <SelectTrigger id="category-parent" className="w-full">
            <SelectValue placeholder={isCatalogLoading ? "Loading categories..." : "Top level"} />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ROOT_CATEGORY_VALUE}>No parent (top level)</SelectItem>
            {parentOptions.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name} (/{category.originalSlug || category.slug})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          {isEditing
            ? "The current category and its descendants are excluded to prevent hierarchy cycles."
            : "Leave this at top level when the category has no parent."}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="category-name">Category name</FieldLabel>
        <Input
          id="category-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={150}
          placeholder="e.g. Tailoring"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
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
            ? "The backend treats a category slug as immutable after creation."
            : "Use a unique, lowercase URL-safe slug. It cannot be changed later."}
        </FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="category-sort-order">Sort order</FieldLabel>
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
          <FieldDescription>Lower values appear first when the catalog is sorted.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="category-status">Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(value) => update("status", value as AdminCatalogStatus)}
          >
            <SelectTrigger id="category-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {CATEGORY_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>Inactive categories remain available to existing records.</FieldDescription>
        </Field>
      </div>
    </FieldGroup>
  );
}
