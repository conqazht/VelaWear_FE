"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ColorFormValues = {
  name: string;
  hexCode: string;
  sortOrder: string;
};

export const EMPTY_COLOR_FORM: ColorFormValues = {
  name: "",
  hexCode: "",
  sortOrder: "0",
};

type ColorFormProps = {
  values: ColorFormValues;
  onChange: (next: ColorFormValues) => void;
};

export function ColorForm({ values, onChange }: ColorFormProps) {
  function update<Key extends keyof ColorFormValues>(key: Key, value: ColorFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  const hasValidPreview = /^#[0-9A-F]{6}$/.test(values.hexCode);

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="color-name">Color name</FieldLabel>
        <Input
          id="color-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={80}
          placeholder="Midnight Black"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="color-hex-code">Hex code</FieldLabel>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-9 shrink-0 rounded-md border shadow-xs"
            style={{ backgroundColor: hasValidPreview ? values.hexCode : "transparent" }}
          />
          <Input
            id="color-hex-code"
            value={values.hexCode}
            onChange={(event) => update("hexCode", event.target.value.toUpperCase())}
            maxLength={7}
            pattern="#[0-9A-Fa-f]{6}"
            placeholder="#1C1A18"
            spellCheck={false}
            required
          />
        </div>
        <FieldDescription>Enter a six-digit hexadecimal color in #RRGGBB format.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="color-sort-order">Sort order</FieldLabel>
        <Input
          id="color-sort-order"
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
