"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FashionImage } from "@/components/shop/fashion-image";
import { useCart } from "@/components/shop/cart-provider";
import { money } from "@/lib/vela-data";
import { RelatedProducts } from "@/components/shop/related-products";
import { useCartStore } from "@/store/cart-store";
import { useI18n } from "@/components/providers/i18n-provider";

export function CartPageClient() {
  const { locale, t } = useI18n();
  const { cart, subtotal, updateQuantity, removeItem } = useCart();
  const hasHydrated = useCartHydration();
  const shipping = subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping;
  const hasFlashItem = cart.some((item) => item.priceSource === "FLASH_SALE");

  if (!hasHydrated) {
    return (
      <div
        className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]"
        aria-busy="true"
      >
        <span role="status" className="sr-only">
          {t("common.loading")}
        </span>
        <CartPageLoadingFallback />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      {/* Breadcrumbs */}
      <div className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">{t("cart.title")}</span>
      </div>

      <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
            {t("cart.title")}
          </h1>
          {cart.length > 0 && (
            <p className="block text-xs uppercase tracking-widest text-[#1c1a18]/60 mt-2">
              {t("cart.savedCount", { count: cart.length })}
            </p>
          )}
        </div>
        <Link
          href="/collection"
          className="text-xs font-semibold uppercase tracking-wider text-[#b85a3c] hover:underline animate-none"
        >
          ← {t("cart.continueShopping")}
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="mx-auto max-w-md pb-12 text-center select-none min-h-[50vh] flex flex-col justify-start pt-16 items-center">
          <ShoppingBag className="mx-auto mb-6 size-16 text-[#1c1a18]/20 stroke-[1.2]" />
          <p className="mb-8 text-sm leading-relaxed text-[#1c1a18]/60 max-w-xs">
            {t("cart.emptyDescription")}
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b85a3c]"
          >
            {t("cart.shopAll")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 min-h-[80vh]">
          <div className="space-y-6 lg:col-span-8">
            {hasFlashItem ? (
              <div className="flex gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">{t("sale.cart.flashNotReserved.title")}</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/75">
                    {t("sale.cart.flashNotReserved.description")}
                  </p>
                </div>
              </div>
            ) : null}
            <AnimatePresence initial={false}>
              {cart.map((item) => {
                const key = `${item.id}-${item.color}-${item.size}`;
                return (
                  <CartItemRow
                    key={key}
                    item={item}
                    locale={locale}
                    t={t}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          <Card className="rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-4">
            <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
              {t("cart.orderSummary")}
            </h2>
            <div className="space-y-4 text-xs tracking-wide">
              <div className="flex justify-between text-[#1c1a18]/65">
                <span>{t("cart.subtotal")}</span>
                <span className="font-semibold text-[#1c1a18] font-numeric">
                  {money(subtotal, locale)}
                </span>
              </div>
              <div className="flex justify-between text-[#1c1a18]/65">
                <span>{t("cart.standardShipping")}</span>
                <span className="font-semibold text-[#1c1a18]">
                  {shipping === 0 ? t("common.complimentary") : money(shipping, locale)}
                </span>
              </div>
              <Separator className="my-6 bg-[#1c1a18]/10" />
              <div className="flex justify-between text-sm font-semibold text-[#1c1a18] md:text-base">
                <span>{t("cart.total")}</span>
                <span className="font-serif text-lg tracking-wider font-numeric">
                  {money(total, locale)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-md bg-[#f7f4ef] p-3 text-[10px] leading-relaxed text-[#1c1a18]/65">
              <Tag className="mt-0.5 size-4 shrink-0 text-[#b85a3c]" />
              <span>
                {t("cart.giftPackaging")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#1c1a18] py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition-colors hover:bg-[#b85a3c]"
            >
              {t("cart.checkout")}
              <ArrowRight className="size-4" />
            </Link>

            <p className="mt-4 text-center text-[10px] uppercase leading-relaxed tracking-widest text-[#1c1a18]/50">
              {t("sale.cart.estimateNotice")}
            </p>
          </Card>
        </div>
      )}

      {/* Recommended Products */}
      <div className="mt-8">
        <RelatedProducts 
          categoryId={undefined}
          categoryCode={"AO"}
          currentProductSlug={""}
        />
      </div>
    </div>
  );
}

function getCartItemMaximum(item: (ReturnType<typeof useCart>["cart"])[number]) {
  const limits = [item.availableQuantity, item.remainingQuota, item.customerRemaining].filter(
    (value): value is number => typeof value === "number" && value >= 0,
  );
  return limits.length > 0 ? Math.min(...limits) : null;
}

function useCartHydration() {
  return useSyncExternalStore(
    (callback) => {
      const unsubscribeHydrate = useCartStore.persist.onHydrate(callback);
      const unsubscribeFinish = useCartStore.persist.onFinishHydration(callback);

      return () => {
        unsubscribeHydrate();
        unsubscribeFinish();
      };
    },
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
}

function CartPageLoadingFallback() {
  return (
    <div aria-hidden="true">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-2.5 w-12 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-2 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-16 rounded-none bg-[#efe7dc]" />
      </div>

      <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-12 w-44 rounded-none bg-[#efe7dc] md:h-14 md:w-56" />
          <Skeleton className="h-3 w-24 rounded-none bg-[#efe7dc]" />
        </div>
        <Skeleton className="h-3 w-32 rounded-none bg-[#efe7dc]" />
      </div>

      <div className="grid min-h-[80vh] grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={index}
              className="flex gap-6 rounded-md border-[#1c1a18]/5 bg-white p-6 py-6 sm:flex-row"
            >
              <Skeleton className="h-32 w-24 shrink-0 rounded-none bg-[#efe7dc] sm:h-36 sm:w-28" />

              <div className="flex min-w-0 flex-grow flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-5 w-40 max-w-[60%] rounded-none bg-[#efe7dc]" />
                    <Skeleton className="h-5 w-20 shrink-0 rounded-none bg-[#efe7dc]" />
                  </div>
                  <div className="mt-3 flex gap-4">
                    <Skeleton className="h-3 w-24 rounded-none bg-[#efe7dc]" />
                    <Skeleton className="h-3 w-16 rounded-none bg-[#efe7dc]" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#1c1a18]/5 pt-4">
                  <div className="flex items-center gap-2 rounded-sm border border-[#1c1a18]/10 bg-[#efebe4]/30 px-2 py-1">
                    <Skeleton className="size-8 rounded-full bg-[#efe7dc]" />
                    <Skeleton className="h-3 w-6 rounded-none bg-[#efe7dc]" />
                    <Skeleton className="size-8 rounded-full bg-[#efe7dc]" />
                  </div>
                  <Skeleton className="h-3 w-16 rounded-none bg-[#efe7dc]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-4">
          <Skeleton className="mb-6 h-6 w-40 rounded-none bg-[#efe7dc]" />
          <div className="space-y-4">
            <div className="flex justify-between gap-6">
              <Skeleton className="h-3 w-20 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-3 w-24 rounded-none bg-[#efe7dc]" />
            </div>
            <div className="flex justify-between gap-6">
              <Skeleton className="h-3 w-28 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-3 w-16 rounded-none bg-[#efe7dc]" />
            </div>
            <Separator className="my-6 bg-[#1c1a18]/10" />
            <div className="flex items-center justify-between gap-6">
              <Skeleton className="h-4 w-16 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-6 w-28 rounded-none bg-[#efe7dc]" />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-md bg-[#f7f4ef] p-3">
            <Skeleton className="size-4 shrink-0 rounded-full bg-[#efe7dc]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-2.5 w-full rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-2.5 w-4/5 rounded-none bg-[#efe7dc]" />
            </div>
          </div>

          <Skeleton className="mt-8 h-12 w-full rounded-sm bg-[#1c1a18]/20" />
          <div className="mt-4 flex justify-center">
            <Skeleton className="h-2.5 w-2/3 rounded-none bg-[#efe7dc]" />
          </div>
        </Card>
      </div>

      <section className="mt-24 border-t border-[#1c1a18]/10 pt-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-52 rounded-none bg-[#efe7dc]" />
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
            <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
          </div>
        </div>
        <div className="flex gap-6 overflow-hidden px-1 pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[240px] flex-none space-y-3 sm:min-w-[280px] md:min-w-[320px]"
            >
              <Skeleton className="aspect-[3/4] w-full rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-5 w-3/4 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-3 w-2/5 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-4 w-1/3 rounded-none bg-[#efe7dc]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CartItemRow — animated exit on removal (Preventing a jarring change · Occasional)
// ---------------------------------------------------------------------------

type CartItemRowProps = {
  item: ReturnType<typeof useCart>["cart"][number];
  locale: ReturnType<typeof useI18n>["locale"];
  t: ReturnType<typeof useI18n>["t"];
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
};

function CartItemRow({ item, locale, t, updateQuantity, removeItem }: CartItemRowProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      layout
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.15 } }
          : {
              opacity: 0,
              transform: "translateX(-16px)",
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }
      }
    >
      <Card className="flex gap-6 rounded-md border-[#1c1a18]/5 bg-white p-6 py-6 transition-shadow hover:shadow-md sm:flex-row">
        <Link
          href={item.productSlug ? `/products/${encodeURIComponent(item.productSlug)}` : "/collection"}
          className="relative mx-auto block h-32 w-24 shrink-0 overflow-hidden rounded-none bg-[#efebe4] sm:mx-0 sm:h-36 sm:w-28"
          aria-label={t("cart.viewProduct", { product: item.name })}
        >
          <FashionImage src={item.image} alt={item.name} />
        </Link>

        <div className="flex flex-grow flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <Link
                href={item.productSlug ? `/products/${encodeURIComponent(item.productSlug)}` : "/collection"}
                className="font-serif text-lg font-semibold text-[#1c1a18] transition-colors hover:text-[#b85a3c]"
              >
                {item.name}
              </Link>
              <div className="text-right">
                <span className="block whitespace-nowrap font-serif text-base font-light tracking-wider text-[#1c1a18] font-numeric">
                  {money(item.price * item.quantity, locale)}
                </span>
                {item.listPrice && item.listPrice > item.price ? (
                  <span className="text-xs text-[#1c1a18]/35 line-through">
                    {money(item.listPrice * item.quantity, locale)}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 flex gap-4 text-[11px] uppercase tracking-wider text-[#1c1a18]/60">
              <span>
                {t("common.color")}:{" "}
                <strong className="text-[#1c1a18]">{item.color}</strong>
              </span>
              <span>
                {t("common.size")}:{" "}
                <strong className="text-[#1c1a18]">{item.size}</strong>
              </span>
            </p>
            {item.priceSource && item.priceSource !== "BASE" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                <span className={item.priceSource === "FLASH_SALE" ? "rounded bg-[#8f2f20] px-2 py-1 text-white" : "rounded bg-[#1c1a18] px-2 py-1 text-white"}>
                  {item.priceSource === "FLASH_SALE"
                    ? t("storefront.sale.type.flash")
                    : t("storefront.sale.type.standard")}
                </span>
                {item.campaignName ? <span className="text-[#1c1a18]/50">{item.campaignName}</span> : null}
                {item.priceSource === "FLASH_SALE" && item.remainingQuota != null ? (
                  <span className="text-[#8f2f20]">
                    {t("sale.cart.remainingQuota", { count: item.remainingQuota })}
                  </span>
                ) : null}
                {item.priceSource === "FLASH_SALE" && item.customerRemaining != null ? (
                  <span className="text-[#8f2f20]">
                    {t("sale.cart.customerRemaining", { count: item.customerRemaining })}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#1c1a18]/5 pt-4">
            <div className="flex items-center gap-1.5 rounded-sm border border-[#1c1a18]/15 bg-[#efebe4]/30 px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label={t("cart.decreaseQuantity")}
                className="size-8 rounded-full text-[#1c1a18] hover:bg-[#efebe4]"
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-8 text-center text-xs font-bold text-[#1c1a18]">
                {item.quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={getCartItemMaximum(item) !== null && item.quantity >= (getCartItemMaximum(item) as number)}
                aria-label={t("cart.increaseQuantity")}
                className="size-8 rounded-full text-[#1c1a18] hover:bg-[#efebe4]"
              >
                <Plus className="size-3" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => removeItem(item.id)}
              className="h-8 rounded-sm text-[10px] font-bold uppercase tracking-widest text-[#b85a3c] hover:bg-[#efebe4]"
            >
              <Trash2 className="size-3.5" />
              {t("cart.remove")}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}