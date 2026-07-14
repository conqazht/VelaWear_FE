"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CouponStatus, CouponType } from "@/lib/api/admin-commerce";

export type CouponFormValues = {
  code: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  status: CouponStatus;
};

export function toLocalDateTimeInput(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function createEmptyCouponForm(): CouponFormValues {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  return {
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrderAmount: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: toLocalDateTimeInput(startDate),
    endDate: toLocalDateTimeInput(endDate),
    status: "ACTIVE",
  };
}

type CouponFormProps = {
  values: CouponFormValues;
  onChange: (next: CouponFormValues) => void;
  isEditing: boolean;
};

const COUPON_TYPES: Array<{ value: CouponType; label: string }> = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed amount" },
];

const COUPON_STATUSES: Array<{ value: CouponStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "EXPIRED", label: "Expired" },
];

export function CouponForm({ values, onChange, isEditing }: CouponFormProps) {
  function update<Key extends keyof CouponFormValues>(key: Key, value: CouponFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="coupon-code">Coupon code</FieldLabel>
        <Input
          id="coupon-code"
          value={values.code}
          onChange={(event) => update("code", event.target.value.toUpperCase())}
          maxLength={50}
          placeholder="WELCOME10"
          disabled={isEditing}
          required
        />
        <FieldDescription>
          {isEditing ? "Coupon codes are immutable after creation." : "Use a unique code up to 50 characters."}
        </FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="coupon-type">Discount type</FieldLabel>
          <Select value={values.type} onValueChange={(value) => update("type", value as CouponType)}>
            <SelectTrigger id="coupon-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {COUPON_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-value">
            {values.type === "PERCENTAGE" ? "Percentage value" : "Discount amount (VND)"}
          </FieldLabel>
          <Input
            id="coupon-value"
            type="number"
            min="0"
            max={values.type === "PERCENTAGE" ? "100" : undefined}
            step="0.01"
            value={values.value}
            onChange={(event) => update("value", event.target.value)}
            placeholder={values.type === "PERCENTAGE" ? "10" : "50000"}
            required
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="coupon-minimum">Minimum order (VND)</FieldLabel>
          <Input
            id="coupon-minimum"
            type="number"
            min="0"
            step="0.01"
            value={values.minOrderAmount}
            onChange={(event) => update("minOrderAmount", event.target.value)}
            required
          />
          <FieldDescription>Send 0 when there is no minimum order value.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-maximum">Maximum discount (VND)</FieldLabel>
          <Input
            id="coupon-maximum"
            type="number"
            min="0"
            step="0.01"
            value={values.maxDiscount}
            onChange={(event) => update("maxDiscount", event.target.value)}
            placeholder="No cap"
          />
          <FieldDescription>Optional; leave blank for no discount cap.</FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="coupon-usage-limit">Usage limit</FieldLabel>
        <Input
          id="coupon-usage-limit"
          type="number"
          min="0"
          step="1"
          value={values.usageLimit}
          onChange={(event) => update("usageLimit", event.target.value)}
          placeholder="Unlimited"
        />
        <FieldDescription>Optional; leave blank for unlimited uses.</FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="coupon-start-date">Starts at</FieldLabel>
          <Input
            id="coupon-start-date"
            type="datetime-local"
            value={values.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-end-date">Ends at</FieldLabel>
          <Input
            id="coupon-end-date"
            type="datetime-local"
            value={values.endDate}
            onChange={(event) => update("endDate", event.target.value)}
            required
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="coupon-status">Status</FieldLabel>
        <Select value={values.status} onValueChange={(value) => update("status", value as CouponStatus)}>
          <SelectTrigger id="coupon-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {COUPON_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}
