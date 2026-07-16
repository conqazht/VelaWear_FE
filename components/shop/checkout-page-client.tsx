"use client";

import Link from "next/link";
import type { ComponentProps, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  LockKeyhole,
  Loader2,
  AlertTriangle,
  Truck,
  ShoppingBag,
  AlarmClock,
  RefreshCw,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FashionImage } from "@/components/shop/fashion-image";
import { FieldLabel } from "@/components/shop/field-label";
import { useCart } from "@/components/shop/cart-provider";
import { money } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import {
  submitCheckout,
  previewCheckout,
  extractCheckoutError,
  type CheckoutRequest,
  type CheckoutPreviewRequest,
  type CheckoutPreviewResponse,
  type CheckoutResponse,
  type PaymentInitiationResponse,
} from "@/lib/checkout-api";
import { checkoutSchema, createCheckoutSchema } from "@/lib/validations";
import { formatDate } from "@/lib/i18n/format";
import {
  getVietnamProvinces,
  getVietnamWards,
  type VietnamProvince,
  type VietnamWard,
} from "@/lib/vietnam-address-api";
import { useI18n } from "@/components/providers/i18n-provider";

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CHECKOUT_DETAILS_STORAGE_PREFIX = "vela-checkout-details";

let fallbackIdempotencySequence = 0;

function createCheckoutIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackIdempotencySequence += 1;
  return `checkout-fallback-${fallbackIdempotencySequence}`;
}

function checkoutDetailsStorageKey(userId: number) {
  return `${CHECKOUT_DETAILS_STORAGE_PREFIX}:${userId}`;
}

// ---------------------------------------------------------------------------
// Payment method options
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = [
  { value: "COD" as const, disabled: false },
  { value: "SEPAY" as const, disabled: false },
] as const;

type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutPageClient() {
  const { locale, t } = useI18n();
  const localizedCheckoutSchema = useMemo(() => createCheckoutSchema(locale), [locale]);
  const { cart, clearCart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("COD");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [addressApiError, setAddressApiError] = useState<string | null>(null);
  const previewRequestIdRef = useRef(0);
  const idempotencyRef = useRef<{
    key: string;
    baseSignature: string;
    request: CheckoutRequest;
    serverTime: string;
  } | null>(null);
  const checkoutSubmissionRef = useRef<Promise<void> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(localizedCheckoutSchema as never),
    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      address: "",
      provinceCode: "",
      wardCode: "",
    },
  });

  const selectedProvinceCode = useWatch({ control, name: "provinceCode" });
  const isLoadingWards = Boolean(selectedProvinceCode) && wards.length === 0 && !addressApiError;

  // Restore the last successful checkout details for this account.
  useEffect(() => {
    if (!user) return;

    try {
      const storedValue = window.localStorage.getItem(checkoutDetailsStorageKey(user.id));
      if (storedValue) {
        const parsedDetails = localizedCheckoutSchema.safeParse(JSON.parse(storedValue));
        if (parsedDetails.success) {
          setValue("email", parsedDetails.data.email);
          setValue("phone", parsedDetails.data.phone);
          setValue("firstName", parsedDetails.data.firstName);
          setValue("lastName", parsedDetails.data.lastName);
          setValue("address", parsedDetails.data.address);
          setValue("provinceCode", parsedDetails.data.provinceCode);
          setValue("wardCode", parsedDetails.data.wardCode);
          return;
        }
      }
    } catch {
      // Ignore unavailable or malformed browser storage and use account defaults.
    }

    setValue("email", user.email);
    const names = user.fullName.split(" ");
    setValue("firstName", names[0] || "");
    setValue("lastName", names.slice(1).join(" ") || "");
  }, [localizedCheckoutSchema, user, setValue]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getVietnamProvinces(controller.signal)
      .then((data) => {
        if (!active) return;
        setProvinces(data);
        setAddressApiError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAddressApiError(t("checkout.provinceLoadError"));
      })
      .finally(() => {
        if (active) setIsLoadingProvinces(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [t]);

  useEffect(() => {
    if (!selectedProvinceCode) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    getVietnamWards(Number(selectedProvinceCode), controller.signal)
      .then((data) => {
        if (!active) return;
        setWards(data);
        setAddressApiError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setWards([]);
        setAddressApiError(t("checkout.wardLoadError"));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedProvinceCode, t]);

  const activeItemsList = cart;

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
    [
      appliedCouponCode,
      buildPreviewRequest,
      cart.length,
      getCheckoutErrorMessage,
      isAuthenticated,
    ],
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
  const subtotal = activeItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
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
      (province) => String(province.code) === data.provinceCode
    );
    const selectedWard = wards.find((ward) => String(ward.code) === data.wardCode);

    if (!selectedProvince || !selectedWard) {
      setAddressApiError(t("checkout.addressRequired"));
      return;
    }

    try {
      const baseRequest: CheckoutRequest = {
        receiverName: `${data.firstName} ${data.lastName}`.trim(),
        receiverPhone: data.phone,
        receiverAddress: [data.address, selectedWard.name, selectedProvince.name].join(", "),
        paymentMethod,
        couponCode: appliedCouponCode || undefined,
      };

      const baseSignature = JSON.stringify(baseRequest);
      let attempt = idempotencyRef.current;

      if (!attempt || attempt.baseSignature !== baseSignature) {
        // Preview ngay trước lần ghi đầu tiên để tổng tiền luôn là dữ liệu mới
        // nhất từ DB. Nếu phản hồi checkout bị thất lạc, lần thử lại phải gửi
        // nguyên request + Idempotency-Key cũ (không preview lại trên cart đã
        // được server xóa sau khi tạo đơn thành công).
        const latestPreview = await previewCheckout(
          buildPreviewRequest(appliedCouponCode),
        );
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
          window.localStorage.setItem(
            checkoutDetailsStorageKey(user.id),
            JSON.stringify(data)
          );
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

  const onCheckoutFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(onCompletePurchase)(event);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("checkout.signInTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("checkout.signInDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            {t("checkout.signIn")}
          </Link>
        </Card>
      </div>
    );
  }

  if (orderCompleted && completedOrder) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px] min-h-[80vh] flex flex-col justify-center items-center">
        <Card className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-12 py-12 text-center shadow-xl">
          <CheckCircle2 className="mb-6 size-14 text-[#b85a3c]" />
          <h1 className="mb-4 font-serif text-3xl font-light text-[#1c1a18]">
            {t("checkout.successTitle")}
          </h1>
          <p className="mb-2 text-sm leading-relaxed text-[#1c1a18]/65">
            {t("checkout.successDescription", { brand: "VELA WEAR" })}
          </p>
          <p className="mb-2 text-xs font-semibold text-[#1c1a18]/50">
            {t("checkout.orderCode")}:{" "}
            <span className="font-serif text-sm tracking-wide text-black">
              {completedOrder.orderCode}
            </span>
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px] uppercase tracking-widest text-[#1c1a18]/45">
            <span>
              {t("checkout.total")}:{" "}
              <strong className="text-[#1c1a18] font-numeric">
                {money(completedOrder.finalAmount, locale)}
              </strong>
            </span>
            <span>
              {t("checkout.payment")}:{" "}
              <strong className="text-[#1c1a18]">
                {completedOrder.paymentMethod === "COD"
                  ? t("checkout.cod")
                  : completedOrder.paymentMethod === "SEPAY"
                    ? t("sale.checkout.payment.sepay")
                    : completedOrder.paymentMethod}
              </strong>
            </span>
            <span>
              {t("checkout.status")}:{" "}
              <strong className="text-[#1c1a18]">
                {{
                  PENDING: t("order.status.pending"),
                  CONFIRMED: t("order.status.confirmed"),
                  PROCESSING: t("order.status.processing"),
                  SHIPPING: t("order.status.shipping"),
                  DELIVERED: t("order.status.delivered"),
                  CANCELLED: t("order.status.cancelled"),
                }[completedOrder.status.toUpperCase()] ?? completedOrder.status}
              </strong>
            </span>
          </div>
          {completedOrder.paymentDueAt ? (
            <PaymentDeadline
              paymentDueAt={completedOrder.paymentDueAt}
              reservationExpiresAt={completedOrder.reservationExpiresAt}
              serverTime={completedOrder.serverTime}
              paymentInitiation={completedOrder.paymentInitiation}
            />
          ) : (
            <PaymentContinuationForm
              paymentInitiation={completedOrder.paymentInitiation}
            />
          )}
          <div className="mb-6 h-px w-12 bg-[#1c1a18]/10" />
          <p className="mb-10 max-w-sm text-xs font-light leading-relaxed text-[#1c1a18]/60">
            {t("checkout.deliveryUpdates", { name: completedOrder.receiverName })}
          </p>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-md transition-colors hover:bg-[#b85a3c]"
          >
            {t("checkout.backHome")}
          </Link>
        </Card>
      </div>
    );
  }

  if (activeItemsList.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <ShoppingBag className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("checkout.emptyTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("checkout.emptyDescription")}
          </p>
          <Link
            href="/collection"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            {t("cart.continueShopping")}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      <div className="mb-8 flex justify-between gap-4">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-4xl">
          {t("checkout.title")}
        </h1>
        <Link
          href="/cart"
          className="text-xs font-semibold uppercase tracking-wider text-[#b85a3c] hover:underline"
        >
          ← {t("checkout.viewCart")}
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <form onSubmit={onCheckoutFormSubmit} className="space-y-10 lg:col-span-7">
          {apiError && (
            <div className="flex items-start gap-3 rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {previewError && (
            <div className="flex items-start justify-between gap-3 rounded border border-amber-500/25 bg-amber-50 p-3 text-sm text-amber-800">
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {previewError}
              </span>
              <button
                type="button"
                onClick={() => void loadPreview().catch(() => undefined)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold underline"
              >
                <RefreshCw className="size-3" /> {t("sale.checkout.preview.retry")}
              </button>
            </div>
          )}

          <Card className="space-y-8 rounded-md border-none bg-white p-6 py-6 shadow-sm">
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

            <div className="space-y-3">
              <SectionTitle number="2" title={t("checkout.shippingAddress")} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CheckoutInput
                  label={t("checkout.firstName")}
                  autoComplete="given-name"
                  placeholder={t("checkout.firstNamePlaceholder")}
                  {...register("firstName")}
                  error={errors.firstName?.message}
                />
                <CheckoutInput
                  label={t("checkout.lastName")}
                  autoComplete="family-name"
                  placeholder={t("checkout.lastNamePlaceholder")}
                  {...register("lastName")}
                  error={errors.lastName?.message}
                />
              </div>
              <CheckoutInput
                label={t("checkout.street")}
                autoComplete="street-address"
                placeholder={t("checkout.streetPlaceholder")}
                {...register("address")}
                error={errors.address?.message}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>{t("checkout.province")}</FieldLabel>
                  {isLoadingProvinces ? (
                    <AddressSelectLoading />
                  ) : (
                    <select
                      autoComplete="address-level1"
                      {...register("provinceCode", {
                        onChange: () => {
                          setValue("wardCode", "");
                          setWards([]);
                        },
                      })}
                      className="h-11 w-full rounded-sm border border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs text-[#1c1a18] outline-none transition-colors focus:border-[#b85a3c] focus:ring-2 focus:ring-[#b85a3c]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">{t("checkout.selectProvince")}</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.provinceCode?.message && (
                    <p className="text-xs text-red-600">{errors.provinceCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <FieldLabel>{t("checkout.ward")}</FieldLabel>
                  {isLoadingWards ? (
                    <AddressSelectLoading />
                  ) : (
                    <select
                      autoComplete="address-level2"
                      disabled={!selectedProvinceCode}
                      {...register("wardCode")}
                      className="h-11 w-full rounded-sm border border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs text-[#1c1a18] outline-none transition-colors focus:border-[#b85a3c] focus:ring-2 focus:ring-[#b85a3c]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">{t("checkout.selectWard")}</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.wardCode?.message && (
                    <p className="text-xs text-red-600">{errors.wardCode.message}</p>
                  )}
                </div>
              </div>
              {addressApiError && (
                <div className="flex items-start gap-2 rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{addressApiError}</span>
                </div>
              )}
            </div>

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
                          ? "border-[#b85a3c] bg-[#b85a3c]/5"
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
                      className="size-4 accent-[#b85a3c]"
                    />
                    <span className="flex items-center gap-2 text-sm text-[#1c1a18]">
                      {method.value === "COD" && (
                        <Truck className="size-4 text-[#1c1a18]/50" />
                      )}
                      {method.value === "COD"
                        ? t("checkout.cod")
                        : t("sale.checkout.payment.sepay")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting || isPreviewLoading}
            className="h-auto w-full rounded-sm bg-[#1c1a18] py-[1.125rem] text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#b85a3c] disabled:opacity-50"
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
        </form>

        <Card className="rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-5">
          <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
            {t("checkout.orderSummary")}
          </h2>
          <div className="no-scrollbar mb-8 max-h-[280px] space-y-4 overflow-y-auto pr-1">
            {activeItemsList.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efebe4]">
                  <FashionImage src={item.image} alt={item.name} />
                </div>
                <div className="min-w-0 flex-grow text-xs">
                  <h4 className="truncate font-serif font-semibold text-[#1c1a18]">
                    {item.name}
                  </h4>
                  <p className="mt-1 truncate text-[9px] uppercase tracking-widest text-[#1c1a18]/50">
                    {t("checkout.quantityShort", { count: item.quantity })} / {item.size || "—"} / {item.color || "—"}
                  </p>
                  {item.priceSource && item.priceSource !== "BASE" ? (
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#8f2f20]">
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
                  <span className="font-serif text-xs font-semibold text-[#1c1a18] font-numeric">
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
                className="h-10 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs font-semibold uppercase tracking-wider focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
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
                className="h-10 shrink-0 rounded-sm bg-[#1c1a18] px-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#b85a3c]"
              >
                {isPreviewLoading
                  ? t("sale.checkout.preview.checkingCoupon")
                  : appliedCouponCode
                    ? t("sale.checkout.preview.updateCoupon")
                    : t("checkout.apply")}
              </Button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
            {appliedCouponCode && !couponError && (
              <p className="mt-2 text-xs text-[#1c1a18]/50">
                {t("sale.checkout.preview.couponVerified", {
                  code: appliedCouponCode,
                })}
              </p>
            )}
            {activeItemsList.some((item) => item.priceSource === "FLASH_SALE") ? (
              <p className="mt-2 text-xs leading-5 text-amber-700">
                {t("sale.checkout.coupon.flashIneligible")}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 border-t border-[#1c1a18]/5 pt-6 text-xs tracking-wide">
            <LedgerRow label={t("cart.subtotal")} value={money(displayedSubtotal, locale)} />
            <LedgerRow
              label={t("checkout.shipping")}
              value={displayedShippingFee === 0 ? t("common.complimentary") : money(displayedShippingFee, locale)}
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
              <span className="font-serif text-lg tracking-wider text-[#b85a3c] font-numeric">
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
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#1c1a18] text-[11px] font-semibold text-white">
        {number}
      </span>
      <h2 className="font-serif text-lg font-medium tracking-wide text-[#1c1a18]">
        {title}
      </h2>
    </div>
  );
}

function CheckoutInput({
  label,
  error,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Input
        {...props}
        className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-4 text-sm focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function LedgerRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "flex justify-between text-[#b85a3c]"
          : "flex justify-between text-[#1c1a18]/65"
      }
    >
      <span>{label}</span>
      <span className="font-semibold text-[#1c1a18]">{value}</span>
    </div>
  );
}

function AddressSelectLoading() {
  return <Skeleton className="h-11 w-full rounded-sm bg-[#f7f4ef]" aria-hidden="true" />;
}

function PaymentDeadline({
  paymentDueAt,
  reservationExpiresAt,
  serverTime,
  paymentInitiation,
}: {
  paymentDueAt: string;
  reservationExpiresAt?: string | null;
  serverTime?: string | null;
  paymentInitiation?: PaymentInitiationResponse | null;
}) {
  const { locale, t } = useI18n();
  const [clockOrigin] = useState(() => {
    const clientTime = Date.now();
    const parsedServerTime = serverTime ? Date.parse(serverTime) : Number.NaN;
    const serverOffset = Number.isFinite(parsedServerTime)
      ? parsedServerTime - clientTime
      : 0;

    return {
      serverOffset,
      initialNow: clientTime + serverOffset,
    };
  });
  const [now, setNow] = useState(clockOrigin.initialNow);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setNow(Date.now() + clockOrigin.serverOffset),
      1_000,
    );
    return () => window.clearInterval(intervalId);
  }, [clockOrigin.serverOffset]);

  const dueTimestamp = Date.parse(paymentDueAt);
  const releaseTimestamp = reservationExpiresAt
    ? Date.parse(reservationExpiresAt)
    : dueTimestamp;
  const remainingPaymentMs = Math.max(0, dueTimestamp - now);
  const remainingGraceMs = Math.max(0, releaseTimestamp - now);
  const isPastPaymentDue = now >= dueTimestamp;
  const isReleased = now >= releaseTimestamp;

  return (
    <>
      <div
        className={`mb-6 w-full rounded border p-4 text-left ${
          isReleased
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <AlarmClock className="size-4" />
          {isReleased
            ? t("sale.checkout.payment.expiredTitle")
            : isPastPaymentDue
              ? t("sale.checkout.payment.graceTitle")
              : t("sale.checkout.payment.remainingTitle")}
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
          {formatRemainingTime(isPastPaymentDue ? remainingGraceMs : remainingPaymentMs)}
        </p>
        <p className="mt-2 text-[11px] leading-5 opacity-75">
          {isReleased
            ? t("sale.checkout.payment.releasedDescription")
            : t("sale.checkout.payment.deadlineDescription", {
                time: formatDate(dueTimestamp, locale, { timeStyle: "short" }),
                seconds: 30,
              })}
        </p>
      </div>
      {!isReleased ? (
        <PaymentContinuationForm paymentInitiation={paymentInitiation} />
      ) : null}
    </>
  );
}

function PaymentContinuationForm({
  paymentInitiation,
}: {
  paymentInitiation?: PaymentInitiationResponse | null;
}) {
  const { t } = useI18n();
  if (!paymentInitiation?.actionUrl) return null;

  return (
    <form
      action={paymentInitiation.actionUrl}
      method={paymentInitiation.method.toLowerCase()}
      className="mb-6 w-full"
    >
      {Object.entries(paymentInitiation.fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        className="w-full rounded-sm bg-[#8f2f20] py-3 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-[#6f2318]"
      >
        {t("sale.checkout.payment.continue")}
      </Button>
    </form>
  );
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
