"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { z } from "zod";
import type { CartItem } from "@/lib/vela-data";
import type { User } from "@/lib/api/types";
import {
  submitCheckout,
  previewCheckout,
  extractCheckoutError,
  type CheckoutRequest,
  type CheckoutPreviewRequest,
  type CheckoutPreviewResponse,
  type CheckoutResponse,
} from "@/lib/checkout-api";
import type { checkoutSchema } from "@/lib/validations";
import type { VietnamProvince, VietnamWard } from "@/lib/vietnam-address-api";
import { useI18n } from "@/components/providers/i18n-provider";

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CHECKOUT_DETAILS_STORAGE_PREFIX = "vela-checkout-details";

let fallbackIdempotencySequence = 0;

export function createCheckoutIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackIdempotencySequence += 1;
  return `checkout-fallback-${fallbackIdempotencySequence}`;
}

export function checkoutDetailsStorageKey(userId: number) {
  return `${CHECKOUT_DETAILS_STORAGE_PREFIX}:${userId}`;
}

export const PAYMENT_METHODS = [
  { value: "COD" as const, disabled: false },
  { value: "SEPAY" as const, disabled: false },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

export interface UseCheckoutSessionOptions {
  cart: CartItem[];
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
  paymentMethod: PaymentMethodValue;
  appliedCouponCode: string;
  provinces: VietnamProvince[];
  wards: VietnamWard[];
  setAddressApiError: (err: string | null) => void;
}

export function useCheckoutSession({
  cart,
  clearCart,
  refreshCart,
  user,
  isAuthenticated,
  paymentMethod,
  appliedCouponCode,
  provinces,
  wards,
  setAddressApiError,
}: UseCheckoutSessionOptions) {
  const { t } = useI18n();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const previewRequestIdRef = useRef(0);
  const idempotencyRef = useRef<{
    key: string;
    baseSignature: string;
    request: CheckoutRequest;
    serverTime: string;
  } | null>(null);
  const checkoutSubmissionRef = useRef<Promise<void> | null>(null);

  const cartSnapshotKey = useMemo(
    () =>
      cart
        .map((item) => `${item.variantId ?? item.id}:${item.quantity}`)
        .sort()
        .join("|"),
    [cart],
  );

  const buildPreviewRequest = useCallback(
    (coupon: string): CheckoutPreviewRequest => {
      return {
        paymentMethod,
        couponCode: coupon || undefined,
      };
    },
    [paymentMethod],
  );

  const getCheckoutErrorMessage = useCallback(
    (checkoutError: ReturnType<typeof extractCheckoutError>) => {
      switch (checkoutError.kind) {
        case "validation":
          return t("checkout.error.validation");
        case "insufficient_stock":
          return t("checkout.error.insufficientStock");
        case "flash_sold_out":
          return t("sale.checkout.error.flashSoldOut");
        case "flash_ended":
          return t("sale.checkout.error.flashEnded");
        case "customer_limit":
          return t("sale.checkout.error.customerLimit");
        case "price_changed":
          return t("sale.checkout.error.priceChanged");
        case "invalid_coupon":
          return t("checkout.error.invalidCoupon");
        case "unauthenticated":
          return t("checkout.error.unauthenticated");
        case "idempotency_conflict":
          return t("sale.checkout.error.idempotencyConflict");
        case "conflict":
          return t("checkout.error.conflict");
        case "unknown":
          return t("checkout.error.unknown");
        default:
          return checkoutError.message;
      }
    },
    [t],
  );

  const loadPreview = useCallback(
    async (coupon = appliedCouponCode) => {
      if (!isAuthenticated || cart.length === 0) return null;

      const requestId = ++previewRequestIdRef.current;
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const nextPreview = await previewCheckout(buildPreviewRequest(coupon));
        if (requestId === previewRequestIdRef.current) {
          setPreview(nextPreview);
          setCouponError(null);
        }
        return nextPreview;
      } catch (error: unknown) {
        const checkoutError = extractCheckoutError(error);
        const localizedError = getCheckoutErrorMessage(checkoutError);
        if (requestId === previewRequestIdRef.current) {
          if (checkoutError.kind === "invalid_coupon") {
            setCouponError(localizedError);
          } else {
            setPreviewError(localizedError);
          }
        }
        throw error;
      } finally {
        if (requestId === previewRequestIdRef.current) setIsPreviewLoading(false);
      }
    },
    [appliedCouponCode, buildPreviewRequest, cart.length, getCheckoutErrorMessage, isAuthenticated],
  );

  useEffect(() => {
    if (!isAuthenticated || !cartSnapshotKey) return;

    const timeoutId = window.setTimeout(() => {
      void loadPreview().catch(() => {
        // Lỗi được hiển thị ngay trong phần tổng tiền.
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cartSnapshotKey, isAuthenticated, loadPreview, paymentMethod]);

  // Client-side estimates for display only — server is authoritative
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const localShippingEstimate = subtotal === 0 ? 0 : 30000;
  const displayedSubtotal = preview?.subtotal ?? subtotal;
  const displayedShippingFee = preview?.shippingFee ?? localShippingEstimate;
  const displayedDiscount = preview?.discountAmount ?? 0;
  const displayedTotal = preview?.finalAmount ?? subtotal + localShippingEstimate;

  const performCompletePurchase = async (data: CheckoutFormValues) => {
    setApiError(null);
    setCouponError(null);
    setAddressApiError(null);

    const selectedProvince = provinces.find(
      (province) => String(province.code) === data.provinceCode,
    );
    const selectedWard = wards.find((ward) => String(ward.code) === data.wardCode);

    if (!selectedProvince || !selectedWard) {
      setAddressApiError(t("checkout.addressRequired"));
      return;
    }

    try {
      const baseRequest: CheckoutRequest = {
        receiverName: data.receiverName.trim(),
        receiverPhone: data.phone,
        receiverAddress: [data.address, selectedWard.name, selectedProvince.name].join(", "),
        paymentMethod,
        couponCode: appliedCouponCode || undefined,
      };

      const baseSignature = JSON.stringify(baseRequest);
      let attempt = idempotencyRef.current;

      if (!attempt || attempt.baseSignature !== baseSignature) {
        const latestPreview = await previewCheckout(buildPreviewRequest(appliedCouponCode));
        setPreview(latestPreview);
        attempt = {
          key: createCheckoutIdempotencyKey(),
          baseSignature,
          request: {
            ...baseRequest,
            pricingFingerprint: latestPreview.pricingFingerprint,
          },
          serverTime: latestPreview.serverTime,
        };
        idempotencyRef.current = attempt;
      }

      const response = await submitCheckout(attempt.request, attempt.key);
      idempotencyRef.current = null;
      setCompletedOrder({ ...response, serverTime: attempt.serverTime });
      setOrderCompleted(true);
      if (user) {
        try {
          window.localStorage.setItem(checkoutDetailsStorageKey(user.id), JSON.stringify(data));
        } catch {
          // Checkout remains successful when browser storage is unavailable.
        }
      }
      clearCart();
    } catch (err: unknown) {
      const checkoutErr = extractCheckoutError(err);

      const localizedError = getCheckoutErrorMessage(checkoutErr);

      if (checkoutErr.kind === "invalid_coupon") {
        setCouponError(localizedError);
      } else {
        setApiError(localizedError);
      }

      if (
        checkoutErr.status === 409 ||
        checkoutErr.kind === "price_changed" ||
        checkoutErr.kind === "flash_sold_out" ||
        checkoutErr.kind === "flash_ended" ||
        checkoutErr.kind === "customer_limit" ||
        checkoutErr.kind === "insufficient_stock"
      ) {
        idempotencyRef.current = null;
        await refreshCart().catch(() => undefined);
        await loadPreview().catch(() => undefined);
      }
    }
  };

  const onCompletePurchase = (data: CheckoutFormValues) => {
    if (checkoutSubmissionRef.current) {
      return checkoutSubmissionRef.current;
    }

    const submission = performCompletePurchase(data).finally(() => {
      if (checkoutSubmissionRef.current === submission) {
        checkoutSubmissionRef.current = null;
      }
    });
    checkoutSubmissionRef.current = submission;
    return submission;
  };

  return {
    orderCompleted,
    completedOrder,
    apiError,
    setApiError,
    couponError,
    setCouponError,
    preview,
    previewError,
    isPreviewLoading,
    loadPreview,
    onCompletePurchase,
    subtotal,
    displayedSubtotal,
    displayedShippingFee,
    displayedDiscount,
    displayedTotal,
  };
}
