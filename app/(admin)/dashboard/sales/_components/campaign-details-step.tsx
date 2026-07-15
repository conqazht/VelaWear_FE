"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SaleCampaignType } from "@/lib/api/admin-sales";

import type { SaleCampaignFormValues } from "../_data/sale-campaign-form";

type CampaignDetailsStepProps = {
  values: SaleCampaignFormValues;
  onChange: (next: SaleCampaignFormValues) => void;
  codeDisabled: boolean;
  displayDisabled: boolean;
  typeAndScheduleDisabled: boolean;
};

export function CampaignDetailsStep({
  values,
  onChange,
  codeDisabled,
  displayDisabled,
  typeAndScheduleDisabled,
}: CampaignDetailsStepProps) {
  function update<Key extends keyof SaleCampaignFormValues>(
    key: Key,
    value: SaleCampaignFormValues[Key],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateType(type: SaleCampaignType) {
    onChange({
      ...values,
      type,
      items: values.items.map((item) => ({
        ...item,
        quota: type === "FLASH" ? item.quota || "1" : "",
        maxPerCustomer: type === "FLASH" ? item.maxPerCustomer : "",
      })),
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sale-code">Campaign code</FieldLabel>
          <Input
            id="sale-code"
            value={values.code}
            onChange={(event) => update("code", event.target.value.toUpperCase())}
            placeholder="SUMMER_2026"
            maxLength={50}
            disabled={codeDisabled}
            required
          />
          <FieldDescription>
            Permanent identifier using uppercase letters, numbers, dashes, or underscores.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sale-type">Campaign type</FieldLabel>
          <Select
            value={values.type}
            onValueChange={(value) => updateType(value as SaleCampaignType)}
            disabled={typeAndScheduleDisabled}
          >
            <SelectTrigger id="sale-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectItem value="STANDARD">Standard sale</SelectItem>
              <SelectItem value="FLASH">Flash sale</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            {values.type === "FLASH"
              ? "Flash sales require quota and may set a per-customer limit."
              : "Standard sales run on schedule without quota."}
          </FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="sale-name">Campaign name</FieldLabel>
        <Input
          id="sale-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Summer Essentials"
          maxLength={150}
          disabled={displayDisabled}
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="sale-description">Description</FieldLabel>
        <Textarea
          id="sale-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Internal and storefront campaign description"
          maxLength={2_000}
          disabled={displayDisabled}
          rows={4}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="sale-banner">Banner URL</FieldLabel>
        <Input
          id="sale-banner"
          type="url"
          value={values.bannerUrl}
          onChange={(event) => update("bannerUrl", event.target.value)}
          placeholder="https://cdn.example.com/summer-sale.jpg"
          disabled={displayDisabled}
        />
        <FieldDescription>
          Optional storefront artwork. Use an absolute HTTP or HTTPS URL.
        </FieldDescription>
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sale-starts-at">Starts at</FieldLabel>
          <Input
            id="sale-starts-at"
            type="datetime-local"
            value={values.startsAt}
            onChange={(event) => update("startsAt", event.target.value)}
            disabled={typeAndScheduleDisabled}
            required
          />
          <FieldDescription>Entered in your local timezone and sent as UTC.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sale-ends-at">Ends at</FieldLabel>
          <Input
            id="sale-ends-at"
            type="datetime-local"
            value={values.endsAt}
            onChange={(event) => update("endsAt", event.target.value)}
            disabled={typeAndScheduleDisabled}
            required
          />
          <FieldDescription>The end instant is exclusive.</FieldDescription>
        </Field>
      </div>
    </div>
  );
}
