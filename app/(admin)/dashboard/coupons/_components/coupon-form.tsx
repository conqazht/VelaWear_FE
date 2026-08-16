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

const COUPON_TYPE_MESSAGE_KEYS = {
  PERCENTAGE: "admin.commerce.coupons.type.percentage",
  FIXED_AMOUNT: "admin.commerce.coupons.type.fixedAmount",
} as const;

const COUPON_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.coupons.status.active",
  INACTIVE: "admin.commerce.coupons.status.inactive",
  EXPIRED: "admin.commerce.coupons.status.expired",
} as const;

const COUPON_TYPES: CouponType[] = ["PERCENTAGE", "FIXED_AMOUNT"];
const COUPON_STATUSES: CouponStatus[] = ["ACTIVE", "INACTIVE", "EXPIRED"];

export function CouponForm({ values, onChange, isEditing }: CouponFormProps) {
  const { t } = useI18n();

  function update<Key extends keyof CouponFormValues>(key: Key, value: CouponFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="coupon-code">{t("admin.commerce.coupons.form.code")}</FieldLabel>
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
          {isEditing
            ? t("admin.commerce.coupons.form.codeImmutable")
            : t("admin.commerce.coupons.form.codeHelp")}
        </FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="coupon-type">{t("admin.commerce.coupons.form.type")}</FieldLabel>
          <Select
            value={values.type}
            onValueChange={(value) => update("type", value as CouponType)}
          >
            <SelectTrigger id="coupon-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {COUPON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(COUPON_TYPE_MESSAGE_KEYS[type])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-value">
            {values.type === "PERCENTAGE"
              ? t("admin.commerce.coupons.form.percentageValue")
              : t("admin.commerce.coupons.form.discountAmount")}
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
          <FieldLabel htmlFor="coupon-minimum">
            {t("admin.commerce.coupons.form.minimum")}
          </FieldLabel>
          <Input
            id="coupon-minimum"
            type="number"
            min="0"
            step="0.01"
            value={values.minOrderAmount}
            onChange={(event) => update("minOrderAmount", event.target.value)}
            required
          />
          <FieldDescription>{t("admin.commerce.coupons.form.minimumHelp")}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-maximum">
            {t("admin.commerce.coupons.form.maximum")}
          </FieldLabel>
          <Input
            id="coupon-maximum"
            type="number"
            min="0"
            step="0.01"
            value={values.maxDiscount}
            onChange={(event) => update("maxDiscount", event.target.value)}
            placeholder={t("admin.commerce.coupons.form.noCap")}
          />
          <FieldDescription>{t("admin.commerce.coupons.form.maximumHelp")}</FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="coupon-usage-limit">
          {t("admin.commerce.coupons.form.usageLimit")}
        </FieldLabel>
        <Input
          id="coupon-usage-limit"
          type="number"
          min="0"
          step="1"
          value={values.usageLimit}
          onChange={(event) => update("usageLimit", event.target.value)}
          placeholder={t("admin.commerce.coupons.form.unlimited")}
        />
        <FieldDescription>{t("admin.commerce.coupons.form.usageLimitHelp")}</FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="coupon-start-date">
            {t("admin.commerce.coupons.form.startsAt")}
          </FieldLabel>
          <Input
            id="coupon-start-date"
            type="datetime-local"
            value={values.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-end-date">
            {t("admin.commerce.coupons.form.endsAt")}
          </FieldLabel>
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
        <FieldLabel htmlFor="coupon-status">{t("admin.commerce.coupons.form.status")}</FieldLabel>
        <Select
          value={values.status}
          onValueChange={(value) => update("status", value as CouponStatus)}
        >
          <SelectTrigger id="coupon-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {COUPON_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(COUPON_STATUS_MESSAGE_KEYS[status])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}
