"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LockKeyhole, AlertTriangle, ShoppingBag, RefreshCw, Plus, Edit2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/components/shop/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useMyAddressesQuery } from "@/lib/queries/commerce";
import type { UserAddress } from "@/lib/api/types";
import { AddressModal } from "@/components/shop/profile/address-modal";
import { cn } from "@/lib/utils";
import { createCheckoutSchema } from "@/lib/validations";
import {
  getVietnamProvinces,
  getVietnamWards,
  type VietnamProvince,
  type VietnamWard,
} from "@/lib/vietnam-address-api";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  useCheckoutSession,
  checkoutDetailsStorageKey,
  type CheckoutFormValues,
  type PaymentMethodValue,
} from "@/components/shop/checkout/use-checkout-session";
import { CheckoutAddressSection } from "@/components/shop/checkout/checkout-address-section";
import { CheckoutOrderSummary } from "@/components/shop/checkout/checkout-order-summary";
import { OrderSuccessCard } from "@/components/shop/checkout/order-success-card";

export function CheckoutPageClient() {
  const { locale, t } = useI18n();
  const localizedCheckoutSchema = useMemo(() => createCheckoutSchema(locale), [locale]);
  const { cart, clearCart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("COD");
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [addressApiError, setAddressApiError] = useState<string | null>(null);

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
  const isWardsLoaded =
    Boolean(selectedProvinceCode) &&
    wards.length > 0 &&
    String(wards[0]?.province_code) === String(selectedProvinceCode);
  const isLoadingWards = Boolean(selectedProvinceCode) && !isWardsLoaded && !addressApiError;

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

    if (wards.length > 0 && String(wards[0]?.province_code) === String(selectedProvinceCode)) {
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
  }, [selectedProvinceCode, wards, t]);

  const {
    orderCompleted,
    completedOrder,
    apiError,
    couponError,
    setCouponError,
    preview,
    previewError,
    isPreviewLoading,
    loadPreview,
    onCompletePurchase,
    displayedSubtotal,
    displayedShippingFee,
    displayedDiscount,
    displayedTotal,
  } = useCheckoutSession({
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
  });

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

  if (cart.length === 0) {
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
        <form onSubmit={onCheckoutFormSubmit} className="space-y-6 lg:col-span-7">
          {apiError && (
            <div className="border-error/20 bg-error/10 text-error flex items-start gap-2 rounded-sm border p-4 text-xs">
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

          <CheckoutAddressSection
            register={register}
            errors={errors}
            setValue={setValue}
            userAddresses={userAddresses}
            selectedAddress={selectedAddress}
            isManualAddressMode={isManualAddressMode}
            setIsManualAddressMode={setIsManualAddressMode}
            onOpenAddressSelectModal={() => {
              setPendingAddressId(selectedAddress?.id ?? userAddresses[0]?.id ?? null);
              setIsAddressSelectModalOpen(true);
            }}
            fillFromAddress={fillFromAddress}
            provinces={provinces}
            wards={wards}
            isLoadingProvinces={isLoadingProvinces}
            selectedProvinceCode={selectedProvinceCode}
            isLoadingWards={isLoadingWards}
            addressApiError={addressApiError}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </form>

        <CheckoutOrderSummary
          cart={cart}
          locale={locale}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCouponCode={appliedCouponCode}
          setAppliedCouponCode={setAppliedCouponCode}
          couponError={couponError}
          setCouponError={setCouponError}
          isPreviewLoading={isPreviewLoading}
          loadPreview={loadPreview}
          preview={preview}
          displayedSubtotal={displayedSubtotal}
          displayedShippingFee={displayedShippingFee}
          displayedDiscount={displayedDiscount}
          displayedTotal={displayedTotal}
          isSubmitting={isSubmitting}
        />
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

                  <div className="mt-1 pl-[30px] text-left">
                    <p className="text-ink/70 text-xs leading-tight">{addr.phone}</p>
                  </div>

                  <div className="mt-1 pl-[30px] text-left">
                    <p
                      className="text-ink/85 truncate text-xs leading-tight"
                      title={addr.addressDetail}
                    >
                      {addr.addressDetail}
                    </p>
                  </div>

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
