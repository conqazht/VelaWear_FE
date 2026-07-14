"use client";

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
  function update<Key extends keyof SizeFormValues>(key: Key, value: SizeFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="size-name">Size name</FieldLabel>
        <Input
          id="size-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={50}
          placeholder="Medium or M"
          required
        />
        <FieldDescription>Use the exact label customers should see on product options.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="size-sort-order">Sort order</FieldLabel>
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
        <FieldDescription>Lower values appear first in attribute option lists.</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
