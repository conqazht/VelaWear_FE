"use client";

import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { AlertTriangle, MapPin, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FieldLabel } from "@/components/shop/field-label";
import type { UserAddress } from "@/lib/api/types";
import type { VietnamProvince, VietnamWard } from "@/lib/vietnam-address-api";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  PAYMENT_METHODS,
  type CheckoutFormValues,
  type PaymentMethodValue,
} from "@/components/shop/checkout/use-checkout-session";
import { SectionTitle, CheckoutInput } from "@/components/shop/checkout/checkout-form-controls";

export interface CheckoutAddressSectionProps {
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  setValue: UseFormSetValue<CheckoutFormValues>;
  userAddresses: UserAddress[];
  selectedAddress: UserAddress | null;
  isManualAddressMode: boolean;
  setIsManualAddressMode: (manual: boolean) => void;
  onOpenAddressSelectModal: () => void;
  fillFromAddress: (addr: UserAddress, provinceList: VietnamProvince[]) => Promise<void>;
  provinces: VietnamProvince[];
  wards: VietnamWard[];
  isLoadingProvinces: boolean;
  selectedProvinceCode: string;
  isLoadingWards: boolean;
  addressApiError: string | null;
  paymentMethod: PaymentMethodValue;
  setPaymentMethod: (method: PaymentMethodValue) => void;
}

export function CheckoutAddressSection({
  register,
  errors,
  setValue,
  userAddresses,
  selectedAddress,
  isManualAddressMode,
  setIsManualAddressMode,
  onOpenAddressSelectModal,
  fillFromAddress,
  provinces,
  wards,
  isLoadingProvinces,
  selectedProvinceCode,
  isLoadingWards,
  addressApiError,
  paymentMethod,
  setPaymentMethod,
}: CheckoutAddressSectionProps) {
  const { t } = useI18n();

  return (
    <Card className="space-y-8 rounded-md border-none bg-white p-6 py-6 shadow-sm">
      {/* 1. Contact info */}
      <div className="space-y-3">
        <SectionTitle number="1" title={t("checkout.contact")} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckoutInput
            label={t("checkout.email")}
            type="email"
            autoComplete="email"
            placeholder="address@domain.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <CheckoutInput
            label={t("checkout.phone")}
            type="tel"
            autoComplete="tel"
            placeholder="09xxx xxxxx"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>
      </div>

      {/* 2. Shipping Address */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle number="2" title={t("checkout.shippingAddress")} />
          {userAddresses.length > 0 && !isManualAddressMode && (
            <button
              type="button"
              onClick={onOpenAddressSelectModal}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase underline underline-offset-4 transition-colors hover:text-[#b5573a]"
            >
              <MapPin className="size-3.5" />
              <span>{t("checkout.changeAddress")}</span>
            </button>
          )}
          {userAddresses.length > 0 && isManualAddressMode && (
            <button
              type="button"
              onClick={() => {
                setIsManualAddressMode(false);
                if (selectedAddress) {
                  void fillFromAddress(selectedAddress, provinces);
                }
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase underline underline-offset-4 transition-colors hover:text-[#b5573a]"
            >
              <MapPin className="size-3.5" />
              <span>{t("checkout.useSavedAddress")}</span>
            </button>
          )}
        </div>

        {userAddresses.length > 0 && !isManualAddressMode ? (
          <div className="space-y-3">
            {selectedAddress ? (
              <div className="rounded-md border border-[#1c1a18]/20 bg-[#f7f4ef]/40 p-4 transition-all">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1c1a18]">
                      {selectedAddress.receiverName}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="rounded bg-[#1c1a18] px-1.5 py-0.5 text-[9px] leading-none font-semibold tracking-wider text-white uppercase">
                        {t("account.addresses.default")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#1c1a18]/70">{selectedAddress.phone}</p>
                  <p className="text-xs text-[#1c1a18]/85">{selectedAddress.addressDetail}</p>
                  <p className="text-xs text-[#1c1a18]/60">
                    {[selectedAddress.ward, selectedAddress.province].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsManualAddressMode(true)}
                className="cursor-pointer text-xs text-[#1c1a18]/60 underline transition-colors hover:text-[#1c1a18]"
              >
                {t("checkout.manualAddress")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <CheckoutInput
              label={t("checkout.receiverName")}
              autoComplete="name"
              placeholder={t("checkout.receiverNamePlaceholder")}
              {...register("receiverName")}
              error={errors.receiverName?.message}
            />
            <CheckoutInput
              label={t("checkout.street")}
              autoComplete="street-address"
              placeholder={t("checkout.streetPlaceholder")}
              {...register("address")}
              error={errors.address?.message}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="provinceCode">{t("checkout.province")}</FieldLabel>
                <select
                  id="provinceCode"
                  autoComplete="address-level1"
                  disabled={isLoadingProvinces}
                  aria-invalid={!!errors.provinceCode}
                  aria-describedby={errors.provinceCode ? "provinceCode-error" : undefined}
                  {...register("provinceCode", {
                    onChange: () => {
                      setValue("wardCode", "");
                    },
                  })}
                  className="h-11 w-full rounded-sm border border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs text-[#1c1a18] transition-colors outline-none focus:border-[#b5573a] focus:ring-2 focus:ring-[#b5573a]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {isLoadingProvinces
                      ? t("checkout.loadingProvinces")
                      : t("checkout.selectProvince")}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.provinceCode?.message && (
                  <p id="provinceCode-error" className="text-error text-xs">
                    {errors.provinceCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="wardCode">{t("checkout.ward")}</FieldLabel>
                <select
                  id="wardCode"
                  autoComplete="address-level2"
                  disabled={!selectedProvinceCode || isLoadingWards}
                  aria-invalid={!!errors.wardCode}
                  aria-describedby={errors.wardCode ? "wardCode-error" : undefined}
                  {...register("wardCode")}
                  className="h-11 w-full rounded-sm border border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs text-[#1c1a18] transition-colors outline-none focus:border-[#b5573a] focus:ring-2 focus:ring-[#b5573a]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {isLoadingWards ? t("checkout.loadingWards") : t("checkout.selectWard")}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.wardCode?.message && (
                  <p id="wardCode-error" className="text-error text-xs">
                    {errors.wardCode.message}
                  </p>
                )}
              </div>
            </div>
            {addressApiError && (
              <div className="border-error/20 bg-error/10 text-error flex items-start gap-2 rounded-sm border p-3 text-xs">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{addressApiError}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Payment Method */}
      <div className="space-y-3">
        <SectionTitle number="3" title={t("checkout.paymentMethod")} />
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                method.disabled
                  ? "cursor-not-allowed border-[#1c1a18]/5 bg-[#f7f4ef]/20 opacity-50"
                  : paymentMethod === method.value
                    ? "border-[#b5573a] bg-[#b5573a]/5"
                    : "border-[#1c1a18]/10 bg-white hover:border-[#1c1a18]/25"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={() => setPaymentMethod(method.value)}
                disabled={method.disabled}
                className="size-4 accent-[#b5573a]"
              />
              <span className="flex items-center gap-2 text-sm text-[#1c1a18]">
                {method.value === "COD" && <Truck className="size-4 text-[#1c1a18]/50" />}
                {method.value === "COD"
                  ? t("checkout.cod")
                  : method.value === "SEPAY"
                    ? t("sale.checkout.payment.sepay")
                    : method.value === "VNPAY"
                      ? t("sale.checkout.payment.vnpay")
                      : method.value === "MOMO"
                        ? t("sale.checkout.payment.momo")
                        : t("sale.checkout.payment.stripe")}
              </span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}
