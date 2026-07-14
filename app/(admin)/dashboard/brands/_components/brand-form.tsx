"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCatalogStatus } from "@/lib/api/admin-commerce";

export type BrandFormValues = {
  name: string;
  slug: string;
  description: string;
  status: AdminCatalogStatus;
};

export const EMPTY_BRAND_FORM: BrandFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "ACTIVE",
};

type BrandFormProps = {
  values: BrandFormValues;
  onChange: (next: BrandFormValues) => void;
  isEditing: boolean;
};

const BRAND_STATUSES: Array<{ value: AdminCatalogStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function BrandForm({ values, onChange, isEditing }: BrandFormProps) {
  function update<Key extends keyof BrandFormValues>(key: Key, value: BrandFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="brand-name">Brand name</FieldLabel>
        <Input
          id="brand-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={150}
          placeholder="Nike"
          autoComplete="off"
          required
        />
        <FieldDescription>Use the public-facing brand name, up to 150 characters.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-slug">Slug</FieldLabel>
        <Input
          id="brand-slug"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value.toLowerCase())}
          maxLength={180}
          placeholder="nike"
          autoComplete="off"
          disabled={isEditing}
          required
        />
        <FieldDescription>
          {isEditing
            ? "Brand slugs are immutable after creation."
            : "Use lowercase letters, numbers, and hyphens for a unique URL-safe slug."}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-description">Description</FieldLabel>
        <Textarea
          id="brand-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Optional notes or a public description for this brand."
          className="min-h-28 resize-y"
        />
        <FieldDescription>Optional; leave blank when the brand does not need a description.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-status">Status</FieldLabel>
        <Select
          value={values.status}
          onValueChange={(value) => update("status", value as AdminCatalogStatus)}
        >
          <SelectTrigger id="brand-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {BRAND_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>Inactive brands remain available for historical records.</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
