"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type SizeFormValues = {
  name: string;
  sortOrder: string;
};

export const EMPTY_SIZE_FORM: SizeFormValues = {
  name: "",
  sortOrder: "0",
};

type SizeFormProps = {
  values: SizeFormValues;
  onChange: (next: SizeFormValues) => void;
};

export function SizeForm({ values, onChange }: SizeFormProps) {
  const { t } = useI18n();

  function update<Key extends keyof SizeFormValues>(key: Key, value: SizeFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="size-name">{t("admin.commerce.attributes.sizes.form.name")}</FieldLabel>
        <Input
          id="size-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={50}
          placeholder={t("admin.commerce.attributes.sizes.form.namePlaceholder")}
          required
        />
        <FieldDescription>{t("admin.commerce.attributes.sizes.form.nameHelp")}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="size-sort-order">{t("admin.commerce.attributes.sortOrder")}</FieldLabel>
        <Input
          id="size-sort-order"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.sortOrder}
          onChange={(event) => update("sortOrder", event.target.value)}
          required
        />
        <FieldDescription>{t("admin.commerce.attributes.sortOrderHelp")}</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
