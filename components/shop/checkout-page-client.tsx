"use client";

import Link from "next/link";
import type { ComponentProps, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_VELA } from "@/lib/motion-tokens";
import {
  CheckCircle2,
  LockKeyhole,
  Loader2,
  AlertTriangle,
  Truck,
  ShoppingBag,
  AlarmClock,
  RefreshCw,
  MapPin,
  Plus,
  Edit2,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { FieldLabel } from "@/components/shop/field-label";
import { useCart } from "@/components/shop/cart-provider";
import { money } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import { useMyAddressesQuery } from "@/lib/queries/commerce";
import type { UserAddress } from "@/lib/api/types";
import { AddressModal } from "@/components/shop/profile/address-modal";
import { cn } from "@/lib/utils";
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
      receiverName: "",
      address: "",
      provinceCode: "",
      wardCode: "",
    },
  });

  const selectedProvinceCode = useWatch({ control, name: "provinceCode" });
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false);
  const [isCreateAddressModalOpen, setIsCreateAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [pendingAddressId, setPendingAddressId] = useState<number | null>(null);
  const [isManualAddressMode, setIsManualAddressMode] = useState(false);

  const addressesQuery = useMyAddressesQuery(user?.id, { size: 50 }, Boolean(user?.id));
  const userAddresses = useMemo(
    () => addressesQuery.data?.result ?? [],
    [addressesQuery.data?.result],
  );

  const defaultAddress = useMemo(
    () => userAddresses.find((a) => a.isDefault) ?? userAddresses[0] ?? null,
    [userAddresses],
  );

  const selectedAddress = useMemo(
    () => userAddresses.find((a) => a.id === selectedAddressId) ?? defaultAddress,
    [userAddresses, selectedAddressId, defaultAddress],
  );

  const fillFromAddress = useCallback(
    async (addr: UserAddress, provinceList: VietnamProvince[]) => {
      setValue("receiverName", addr.receiverName || user?.fullName || "");
      setValue("phone", addr.phone || "");
      setValue("address", addr.addressDetail || "");

      const matchedProvince = provinceList.find(
        (p) =>
          p.name.toLowerCase() === addr.province.toLowerCase() ||
          p.codename.toLowerCase() === addr.province.toLowerCase() ||
          String(p.code) === addr.province,
      );

      if (matchedProvince) {
        const pCode = String(matchedProvince.code);
        setValue("provinceCode", pCode, { shouldValidate: true });

        try {
          const wardList = await getVietnamWards(Number(pCode));
          setWards(wardList);
          const matchedWard = wardList.find(
            (w) =>
              w.name.toLowerCase() === addr.ward.toLowerCase() ||
              w.codename.toLowerCase() === addr.ward.toLowerCase() ||
              String(w.code) === addr.ward,
          );
          if (matchedWard) {
            setValue("wardCode", String(matchedWard.code), { shouldValidate: true });
          }
        } catch {
          // Handled gracefully
        }
      }
    },
    [setValue, user?.fullName],
  );

  const handleConfirmAddressSelection = () => {
    const chosen = userAddresses.find((a) => a.id === pendingAddressId);
    if (chosen) {
      setSelectedAddressId(chosen.id);
      void fillFromAddress(chosen, provinces);
      setIsManualAddressMode(false);
    }
    setIsAddressSelectModalOpen(false);
  };

  const hasAutoFilledRef = useRef(false);

  // Restore the last successful checkout details or default address for this account.
  useEffect(() => {
    if (!user) return;

    if (userAddresses.length > 0) {
      if (provinces.length > 0 && !hasAutoFilledRef.current) {
        const addrToFill = userAddresses.find((a) => a.isDefault) ?? userAddresses[0];
        setValue("email", user.email);
        setSelectedAddressId(addrToFill.id);
        void fillFromAddress(addrToFill, provinces);
        hasAutoFilledRef.current = true;
      }
      return;
    }

    if (!addressesQuery.isLoading && !hasAutoFilledRef.current) {
      try {
        const storedValue = window.localStorage.getItem(checkoutDetailsStorageKey(user.id));
        if (storedValue) {
          const raw = JSON.parse(storedValue);
          if (!raw.receiverName && (raw.firstName || raw.lastName)) {
            raw.receiverName = `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
          }
          const parsedDetails = localizedCheckoutSchema.safeParse(raw);
          if (parsedDetails.success) {
            setValue("email", parsedDetails.data.email);
            setValue("phone", parsedDetails.data.phone);
            setValue("receiverName", parsedDetails.data.receiverName);
            setValue("address", parsedDetails.data.address);
            setValue("provinceCode", parsedDetails.data.provinceCode);
            setValue("wardCode", parsedDetails.data.wardCode);
            hasAutoFilledRef.current = true;
            return;
          }
        }
      } catch {
        // Ignore unavailable or malformed browser storage and use account defaults.
      }

      setValue("email", user.email);
      setValue("receiverName", user.fullName || "");
      hasAutoFilledRef.current = true;
    }
  }, [
    user,
    userAddresses,
    provinces,
    addressesQuery.isLoading,
    fillFromAddress,
    localizedCheckoutSchema,
    setValue,
  ]);

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
        setIsLoadingWards(false);
        setAddressApiError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setWards([]);
        setIsLoadingWards(false);
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
  const subtotal = activeItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        // Preview ngay trước lần ghi đầu tiên để tổng tiền luôn là dữ liệu mới
        // nhất từ DB. Nếu phản hồi checkout bị thất lạc, lần thử lại phải gửi
        // nguyên request + Idempotency-Key cũ (không preview lại trên cart đã
        // được server xóa sau khi tạo đơn thành công).
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

  const onCheckoutFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(onCompletePurchase)(event);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b5573a]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("checkout.signInTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("checkout.signInDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#b5573a]"
          >
            {t("checkout.signIn")}
          </Link>
        </Card>
      </div>
    );
  }

  if (orderCompleted && completedOrder) {
    return (
      <div className="mx-auto flex min-h-[80vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
        <OrderSuccessCard completedOrder={completedOrder} locale={locale} t={t} />
      </div>
    );
  }

  if (activeItemsList.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <ShoppingBag className="mb-6 size-12 text-[#b5573a]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("checkout.emptyTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("checkout.emptyDescription")}
          </p>
          <Link
            href="/collection"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#b5573a]"
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
          className="text-xs font-semibold tracking-wider text-[#b5573a] uppercase hover:underline"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle number="2" title={t("checkout.shippingAddress")} />
                {userAddresses.length > 0 && !isManualAddressMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAddressId(selectedAddress?.id ?? userAddresses[0]?.id ?? null);
                      setIsAddressSelectModalOpen(true);
                    }}
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
                          {[selectedAddress.ward, selectedAddress.province]
                            .filter(Boolean)
                            .join(", ")}
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
                          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                            setValue("wardCode", "");
                            if (e.target.value) {
                              setIsLoadingWards(true);
                            } else {
                              setWards([]);
                              setIsLoadingWards(false);
                            }
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
        </form>

        <Card className="rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-5">
          <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
            {t("checkout.orderSummary")}
          </h2>
          <div className="no-scrollbar mb-8 max-h-[280px] space-y-4 overflow-y-auto pr-1">
            {activeItemsList.map((item) => (
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
        </Card>
      </div>

      {/* Address Selection Modal */}
      <Dialog
        open={isAddressSelectModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddressSelectModalOpen(false);
        }}
      >
        <DialogContent className="bg-canvas text-ink w-full max-w-[calc(100%-2rem)] rounded-md border border-[#e4dacf] p-6 shadow-xl sm:max-w-xl sm:p-8">
          <DialogHeader className="mb-2 flex flex-row items-center justify-between text-left">
            <DialogTitle className="text-ink font-serif text-xl font-light tracking-tight">
              {t("checkout.myAddresses")}
            </DialogTitle>
            <button
              type="button"
              onClick={() => {
                setAddressToEdit(null);
                setIsCreateAddressModalOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-[#1c1a18] px-3 py-1.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18] hover:text-white"
            >
              <Plus className="size-3.5" />
              <span>{t("checkout.addNewAddress")}</span>
            </button>
          </DialogHeader>

          <div className="my-3 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
            {userAddresses.map((addr) => {
              const isSelected = (pendingAddressId ?? selectedAddress?.id) === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setPendingAddressId(addr.id)}
                  className={cn(
                    "cursor-pointer rounded-md border p-4 text-left transition-colors duration-150",
                    isSelected
                      ? "bg-surface-card/60 border-[#1c1a18]"
                      : "bg-surface-card/30 border-[#1c1a18]/15 hover:border-[#1c1a18]/40",
                  )}
                >
                  {/* Line 1: Radio + Name + Badge <---> Edit */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                          isSelected ? "border-[#1c1a18] bg-transparent" : "border-[#1c1a18]/30",
                        )}
                      >
                        {isSelected && <div className="size-2.5 rounded-full bg-[#1c1a18]" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-ink max-w-[180px] truncate text-sm leading-none font-semibold">
                          {addr.receiverName}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex h-4.5 shrink-0 items-center rounded bg-[#1c1a18] px-2 text-[10px] leading-none font-semibold tracking-wider text-white uppercase">
                            {t("account.addresses.default")}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressToEdit(addr);
                        setIsCreateAddressModalOpen(true);
                      }}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-sm border border-[#1c1a18]/20 px-2.5 py-1 text-xs font-medium text-[#1c1a18] transition-colors hover:border-[#1c1a18] hover:bg-black/5"
                    >
                      <Edit2 className="size-3" />
                      <span>{t("account.addresses.edit")}</span>
                    </button>
                  </div>

                  {/* Line 2: Phone */}
                  <div className="mt-1 pl-[30px] text-left">
                    <p className="text-ink/70 text-xs leading-tight">{addr.phone}</p>
                  </div>

                  {/* Line 3: Detailed Address */}
                  <div className="mt-1 pl-[30px] text-left">
                    <p
                      className="text-ink/85 truncate text-xs leading-tight"
                      title={addr.addressDetail}
                    >
                      {addr.addressDetail}
                    </p>
                  </div>

                  {/* Line 4: Ward + Province */}
                  <div className="mt-0.5 pl-[30px] text-left">
                    <p
                      className="text-ink/60 truncate text-[11px] leading-tight"
                      title={[addr.ward, addr.province].filter(Boolean).join(", ")}
                    >
                      {[addr.ward, addr.province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#1c1a18]/10 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddressSelectModalOpen(false)}
              className="rounded-sm border-[#1c1a18]/20 text-xs tracking-wider uppercase"
            >
              {t("checkout.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddressSelection}
              className="rounded-sm bg-[#1c1a18] text-xs tracking-wider text-white uppercase hover:bg-[#1c1a18]/90"
            >
              {t("checkout.confirmAddress")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Address Modal inside Checkout */}
      <AddressModal
        isOpen={isCreateAddressModalOpen}
        onClose={() => {
          setIsCreateAddressModalOpen(false);
          setAddressToEdit(null);
        }}
        addressToEdit={addressToEdit}
      />
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#1c1a18] text-[11px] font-semibold text-white">
        {number}
      </span>
      <h2 className="font-serif text-lg font-medium tracking-wide text-[#1c1a18]">{title}</h2>
    </div>
  );
}

function CheckoutInput({
  label,
  error,
  id,
  name,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  const inputId = id || name;
  const errorId = inputId && error ? `${inputId}-error` : undefined;

  return (
    <div>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
        className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-4 text-sm focus-visible:border-[#b5573a] focus-visible:ring-[#b5573a]/20"
      />
      {error && (
        <p id={errorId} className="text-error mt-1 text-xs">
          {error}
        </p>
      )}
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
        highlight ? "flex justify-between text-[#b5573a]" : "flex justify-between text-[#1c1a18]/65"
      }
    >
      <span>{label}</span>
      <span className="font-semibold text-[#1c1a18]">{value}</span>
    </div>
  );
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
    const serverOffset = Number.isFinite(parsedServerTime) ? parsedServerTime - clientTime : 0;

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
  const releaseTimestamp = reservationExpiresAt ? Date.parse(reservationExpiresAt) : dueTimestamp;
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
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
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
      {!isReleased ? <PaymentContinuationForm paymentInitiation={paymentInitiation} /> : null}
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
        className="w-full rounded-sm bg-[#8f2f20] py-3 text-xs font-bold tracking-[0.15em] text-white uppercase hover:bg-[#6f2318]"
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

// ---------------------------------------------------------------------------
// Order success card — animated entrance (Delight · Rare / first-time)
// ---------------------------------------------------------------------------

type OrderSuccessCardProps = {
  completedOrder: CheckoutResponse;
  locale: ReturnType<typeof useI18n>["locale"];
  t: ReturnType<typeof useI18n>["t"];
};

function OrderSuccessCard({ completedOrder, locale, t }: OrderSuccessCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        transform: reduce ? "none" : "scale(0.96) translateY(8px)",
      }}
      animate={{
        opacity: 1,
        transform: "scale(1) translateY(0px)",
      }}
      transition={{
        duration: reduce ? 0.25 : 0.4,
        ease: EASE_VELA,
      }}
      className="mx-auto mt-6 w-full max-w-lg"
    >
      <Card className="flex flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-12 py-12 text-center shadow-xl">
        {/* Check icon — spring pop after card settles */}
        <motion.div
          initial={{ opacity: 0, transform: reduce ? "none" : "scale(0.3)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={
            reduce
              ? { duration: 0.2, ease: "easeOut" }
              : {
                  type: "spring",
                  stiffness: 380,
                  damping: 22,
                  delay: 0.3,
                }
          }
          className="mb-6"
        >
          <CheckCircle2 className="size-14 text-[#b5573a]" />
        </motion.div>

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
        <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px] tracking-widest text-[#1c1a18]/45 uppercase">
          <span>
            {t("checkout.total")}:{" "}
            <strong className="font-numeric text-[#1c1a18]">
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
          <PaymentContinuationForm paymentInitiation={completedOrder.paymentInitiation} />
        )}
        <div className="mb-6 h-px w-12 bg-[#1c1a18]/10" />
        <p className="mb-10 max-w-sm text-xs leading-relaxed font-light text-[#1c1a18]/60">
          {t("checkout.deliveryUpdates", { name: completedOrder.receiverName })}
        </p>
        <Link
          href="/"
          className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-white uppercase shadow-md transition-colors hover:bg-[#b5573a]"
        >
          {t("checkout.backHome")}
        </Link>
      </Card>
    </motion.div>
  );
}
