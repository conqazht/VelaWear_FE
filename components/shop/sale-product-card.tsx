"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { ProductCardShell } from "@/components/shop/product-card-shell";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SaleProductGroup } from "@/lib/sale-utils";
import { money, resolveImageUrl } from "@/lib/vela-data";

type SaleProductCardProps = {
  product: SaleProductGroup;
  isFlash: boolean;
  isUpcoming: boolean;
};

export function SaleProductCard({
  product,
  isFlash,
  isUpcoming,
}: SaleProductCardProps) {
  const { locale, t } = useI18n();
  const href = `/products/${encodeURIComponent(product.productSlug)}`;
  const quotaSoldOut =
    isFlash && product.remainingQuota !== null && product.remainingQuota <= 0;
  const soldOut = quotaSoldOut || product.availableQuantity <= 0;
  const soldOutLabel = quotaSoldOut
    ? t("storefront.sale.flashSoldOut")
    : t("storefront.sale.outOfStock");
  const used =
    product.quota !== null && product.remainingQuota !== null
      ? Math.max(0, product.quota - product.remainingQuota)
      : 0;
  const progress = product.quota
    ? Math.min(100, (used / product.quota) * 100)
    : 0;

  return (
    <ProductCardShell
      href={href}
      imageSrc={resolveImageUrl(product.image)}
      imageAlt={product.productName}
      imageClassName={soldOut ? "grayscale" : undefined}
      imageOverlay={
        soldOut ? (
          <span className="grid h-full w-full place-items-center bg-[#1c1a18]/45 px-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-white">
            {soldOutLabel}
          </span>
        ) : undefined
      }
      badge={
        isFlash
          ? t("storefront.sale.type.flash")
          : t("storefront.sale.type.standard")
      }
      eyebrow={t("storefront.sale.variantOptions", {
        count: product.variants.length,
      })}
      title={product.productName}
      price={money(product.promotionalPrice, locale)}
      originalPrice={
        product.referencePrice > product.promotionalPrice
          ? money(product.referencePrice, locale)
          : undefined
      }
      footerAction={
        <div className="space-y-5">
          {isFlash && product.quota !== null ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <div className="flex items-center justify-between gap-3 text-[11px] text-[#1c1a18]/55">
                <span>
                  {t("storefront.sale.quotaRemaining", {
                    remaining: Math.max(0, product.remainingQuota ?? 0),
                    quota: product.quota,
                  })}
                </span>
                {product.maxPerCustomer ? (
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <Users className="size-3" />
                    {t("storefront.sale.maxPerCustomer", {
                      count: product.maxPerCustomer,
                    })}
                  </span>
                ) : null}
              </div>
              {product.maxPerCustomer ? (
                <p className="text-[10px] leading-4 text-[#1c1a18]/45">
                  {t("storefront.sale.customerQuotaAdvisory")}
                </p>
              ) : null}
            </div>
          ) : null}

          {!soldOut && !isUpcoming ? (
            <Button
              render={<Link href={href} />}
              nativeButton={false}
              className="w-full rounded-sm bg-[#1c1a18] text-white hover:bg-[#b5573a]"
            >
              {t("storefront.sale.selectVariant")}
            </Button>
          ) : (
            <Button disabled className="w-full rounded-sm bg-[#1c1a18]/20 text-white">
              {isUpcoming ? t("storefront.sale.upcoming") : soldOutLabel}
            </Button>
          )}
        </div>
      }
    />
  );
}
