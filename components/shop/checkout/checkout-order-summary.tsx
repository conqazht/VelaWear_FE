"use client";

import { LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { money, type CartItem } from "@/lib/vela-data";
import type { CheckoutPreviewResponse } from "@/lib/checkout-api";
import type { Locale } from "@/lib/i18n";
import { useI18n } from "@/components/providers/i18n-provider";
import { LedgerRow } from "@/components/shop/checkout/checkout-form-controls";

export interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  locale: Locale;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCouponCode: string;
  setAppliedCouponCode: (code: string) => void;
  couponError: string | null;
  setCouponError: (err: string | null) => void;
  isPreviewLoading: boolean;
  loadPreview: (coupon?: string) => Promise<CheckoutPreviewResponse | null>;
  preview: CheckoutPreviewResponse | null;
  displayedSubtotal: number;
  displayedShippingFee: number;
  displayedDiscount: number;
  displayedTotal: number;
  isSubmitting: boolean;
}

export function CheckoutOrderSummary({
  cart,
  locale,
  couponCode,
  setCouponCode,
  appliedCouponCode,
  setAppliedCouponCode,
  couponError,
  setCouponError,
  isPreviewLoading,
  loadPreview,
  preview,
  displayedSubtotal,
  displayedShippingFee,
  displayedDiscount,
  displayedTotal,
  isSubmitting,
}: CheckoutOrderSummaryProps) {
  const { t } = useI18n();

  return (
    <Card className="rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-5">
      <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
        {t("checkout.orderSummary")}
      </h2>
      <div className="no-scrollbar mb-8 max-h-[280px] space-y-4 overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
            <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efe7dc]">
              <FashionImage src={item.image} alt={item.name} />
            </div>
            <div className="min-w-0 flex-grow text-xs">
              <h4 className="truncate font-serif font-semibold text-[#1c1a18]">{item.name}</h4>
              <p className="mt-1 truncate text-[9px] tracking-widest text-[#1c1a18]/50 uppercase">
                {t("checkout.quantityShort", { count: item.quantity })} / {item.size || "—"} /{" "}
                {item.color || "—"}
              </p>
              {item.priceSource && item.priceSource !== "BASE" ? (
                <p className="mt-1 text-[9px] font-semibold tracking-wider text-[#8f4329] uppercase">
                  {item.priceSource === "FLASH_SALE"
                    ? t("storefront.sale.type.flash")
                    : t("storefront.sale.type.standard")}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              {item.listPrice && item.listPrice > item.price ? (
                <span className="block text-[9px] text-[#1c1a18]/35 line-through">
                  {money(item.listPrice * item.quantity, locale)}
                </span>
              ) : null}
              <span className="font-numeric font-serif text-xs font-semibold text-[#1c1a18]">
                {money(item.price * item.quantity, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(event) => {
              setCouponCode(event.target.value);
              if (couponError) setCouponError(null);
            }}
            autoComplete="off"
            placeholder={t("checkout.couponPlaceholder")}
            className="h-10 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs font-semibold tracking-wider uppercase focus-visible:border-[#b5573a] focus-visible:ring-[#b5573a]/20"
          />
          <Button
            type="button"
            disabled={isPreviewLoading}
            onClick={() => {
              const normalizedCoupon = couponCode.trim().toUpperCase();
              setCouponError(null);
              if (normalizedCoupon === appliedCouponCode) {
                void loadPreview(normalizedCoupon).catch(() => undefined);
              } else {
                // Thay đổi state sẽ kích hoạt đúng một lần preview qua effect.
                setAppliedCouponCode(normalizedCoupon);
              }
            }}
            className="h-10 shrink-0 rounded-sm bg-[#1c1a18] px-4 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-[#b5573a]"
          >
            {isPreviewLoading
              ? t("sale.checkout.preview.checkingCoupon")
              : appliedCouponCode
                ? t("sale.checkout.preview.updateCoupon")
                : t("checkout.apply")}
          </Button>
        </div>
        {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
        {appliedCouponCode && !couponError && (
          <p className="mt-2 text-xs text-[#1c1a18]/50">
            {t("sale.checkout.preview.couponVerified", {
              code: appliedCouponCode,
            })}
          </p>
        )}
        {cart.some((item) => item.priceSource === "FLASH_SALE") ? (
          <p className="mt-2 text-xs leading-5 text-amber-700">
            {t("sale.checkout.coupon.flashIneligible")}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 border-t border-[#1c1a18]/5 pt-6 text-xs tracking-wide">
        <LedgerRow label={t("cart.subtotal")} value={money(displayedSubtotal, locale)} />
        <LedgerRow
          label={t("checkout.shipping")}
          value={
            displayedShippingFee === 0
              ? t("common.complimentary")
              : money(displayedShippingFee, locale)
          }
        />
        {appliedCouponCode && (
          <LedgerRow
            label={`${t("checkout.coupon")} (${appliedCouponCode})`}
            value={`-${money(displayedDiscount, locale)}`}
            highlight
          />
        )}
        {preview && appliedCouponCode ? (
          <LedgerRow
            label={t("sale.checkout.couponEligibleSubtotal")}
            value={money(preview.couponEligibleSubtotal, locale)}
          />
        ) : null}
        <Separator className="my-4 bg-[#1c1a18]/10" />
        <div className="flex justify-between font-semibold text-[#1c1a18] md:text-base">
          <span>{t("checkout.estimatedTotal")}</span>
          <span className="font-numeric font-serif text-lg tracking-wider text-[#b5573a]">
            {money(displayedTotal, locale)}
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-[#1c1a18]/40">
          {isPreviewLoading
            ? t("sale.checkout.summary.checking")
            : preview
              ? t("sale.checkout.summary.serverValidated")
              : t("sale.checkout.summary.clientEstimate")}
        </p>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          disabled={isSubmitting || isPreviewLoading}
          className="h-auto w-full rounded-sm bg-[#1c1a18] py-[1.125rem] text-xs font-semibold tracking-[0.2em] text-white uppercase shadow-md hover:bg-[#b5573a] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("checkout.processing")}
            </>
          ) : (
            <>
              <LockKeyhole className="size-4" />
              {t("checkout.complete")}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
