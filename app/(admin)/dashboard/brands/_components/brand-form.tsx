"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const BRAND_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

const BRAND_STATUSES: AdminCatalogStatus[] = ["ACTIVE", "INACTIVE"];

export function BrandForm({ values, onChange, isEditing }: BrandFormProps) {
  const { t } = useI18n();

  function update<Key extends keyof BrandFormValues>(key: Key, value: BrandFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="brand-name">{t("admin.commerce.brands.form.name")}</FieldLabel>
        <Input
          id="brand-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={150}
          placeholder="Nike"
          autoComplete="off"
          required
        />
        <FieldDescription>{t("admin.commerce.brands.form.nameHelp")}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-slug">{t("admin.commerce.categories.form.slug")}</FieldLabel>
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
            ? t("admin.commerce.brands.form.slugImmutable")
            : t("admin.commerce.brands.form.slugHelp")}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-description">
          {t("admin.commerce.common.description")}
        </FieldLabel>
        <Textarea
          id="brand-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder={t("admin.commerce.brands.form.descriptionPlaceholder")}
          className="min-h-28 resize-y"
        />
        <FieldDescription>{t("admin.commerce.brands.form.descriptionHelp")}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="brand-status">{t("admin.commerce.common.status")}</FieldLabel>
        <Select
          value={values.status}
          onValueChange={(value) => update("status", value as AdminCatalogStatus)}
        >
          <SelectTrigger id="brand-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {BRAND_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(BRAND_STATUS_MESSAGE_KEYS[status])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{t("admin.commerce.brands.form.statusHelp")}</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
