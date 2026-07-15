"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AlarmClock, ArrowRight, BadgePercent, ShoppingBag, Users } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SaleCampaign, SaleCampaignType } from "@/lib/api/types";
import { usePublicSalesQuery, saleQueryKeys } from "@/lib/queries/sales";
import {
  getCountdown,
  getServerClockOffset,
  groupSaleItems,
} from "@/lib/sale-utils";
import { money, resolveImageUrl } from "@/lib/vela-data";

export function SaleLanding({ type }: { type: SaleCampaignType }) {
  const isFlash = type === "FLASH";
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const salesQuery = usePublicSalesQuery({
    type,
    locale,
  });
  const [clientNow, setClientNow] = useState(() => Date.now());
  const serverOffset = useMemo(
    () => getServerClockOffset(salesQuery.data?.serverTime),
    [salesQuery.data?.serverTime],
  );
  const now = clientNow + serverOffset;

  useEffect(() => {
    const intervalId = window.setInterval(() => setClientNow(Date.now()), 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.title = isFlash
      ? t("storefront.sale.flash.metaTitle")
      : t("storefront.sale.standard.metaTitle");
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = isFlash
      ? t("storefront.sale.flash.metaDescription")
      : t("storefront.sale.standard.metaDescription");
  }, [isFlash, locale, t]);

  const campaigns = useMemo(() => {
    return [...(salesQuery.data?.campaigns ?? [])]
      .filter((campaign) =>
        isFlash
          ? campaign.phase === "LIVE" || campaign.phase === "UPCOMING"
          : campaign.phase === "LIVE",
      )
      .sort((left, right) => {
      if (left.phase !== right.phase) return left.phase === "LIVE" ? -1 : 1;
      return Date.parse(left.startsAt) - Date.parse(right.startsAt);
    });
  }, [isFlash, salesQuery.data?.campaigns]);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const nextBoundary = campaigns
      .flatMap((campaign) => [Date.parse(campaign.startsAt), Date.parse(campaign.endsAt)])
      .filter((boundary) => boundary > now)
      .sort((left, right) => left - right)[0];
    if (!nextBoundary) return;

    const timeoutId = window.setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: saleQueryKeys.root });
    }, Math.min(nextBoundary - now + 500, 2_147_000_000));
    return () => window.clearTimeout(timeoutId);
  }, [campaigns, now, queryClient]);

  return (
    <main className="min-h-screen bg-[#f7f4ef] pb-24 pt-[96px] text-[#1c1a18] md:pt-[112px]">
      <section
        className={
          isFlash
            ? "border-y border-[#8f2f20]/20 bg-[radial-gradient(circle_at_top_left,_#cf6a4a_0,_#8f2f20_45%,_#1c1a18_100%)] text-white"
            : "border-y border-[#b5573a]/15 bg-[linear-gradient(120deg,_#efe7dc_0%,_#f7f4ef_55%,_#e8d4c3_100%)]"
        }
      >
        <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em]">
              {isFlash ? <AlarmClock className="size-4" /> : <BadgePercent className="size-4" />}
              {isFlash
                ? t("storefront.sale.flash.eyebrow")
                : t("storefront.sale.standard.eyebrow")}
            </div>
            <h1 className="font-serif text-4xl font-light tracking-tight md:text-7xl">
              {isFlash
                ? t("storefront.sale.flash.title")
                : t("storefront.sale.standard.title")}
            </h1>
            <p className={isFlash ? "mt-5 max-w-2xl text-white/75" : "mt-5 max-w-2xl text-[#1c1a18]/65"}>
              {isFlash
                ? t("storefront.sale.flash.description")
                : t("storefront.sale.standard.description")}
            </p>
          </div>
          <Link
            href={isFlash ? "/sale" : "/flash-sale"}
            className={
              isFlash
                ? "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 hover:text-white"
                : "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f2f20]"
            }
          >
            {isFlash
              ? t("storefront.sale.viewStandard")
              : t("storefront.sale.viewFlash")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] space-y-12 px-6 py-12 md:px-12">
        {salesQuery.isLoading ? <SaleLoading /> : null}

        {salesQuery.isError ? (
          <Card className="border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
            {t("storefront.sale.loadError")}
          </Card>
        ) : null}

        {!salesQuery.isLoading && !salesQuery.isError && campaigns.length === 0 ? (
          <Card className="border-dashed border-[#1c1a18]/15 bg-white/50 px-6 py-20 text-center">
            <ShoppingBag className="mx-auto mb-5 size-10 text-[#1c1a18]/25" />
            <h2 className="font-serif text-2xl">{t("storefront.sale.empty.title")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#1c1a18]/55">
              {t("storefront.sale.empty.description")}
            </p>
            <Button
              render={<Link href="/collection" />}
              nativeButton={false}
              className="mt-7 bg-[#1c1a18] text-white hover:bg-[#b5573a]"
            >
              {t("storefront.sale.continueShopping")}
            </Button>
          </Card>
        ) : null}

        {campaigns.map((campaign) => (
          <CampaignSection key={campaign.id} campaign={campaign} now={now} />
        ))}
      </div>
    </main>
  );
}

function CampaignSection({ campaign, now }: { campaign: SaleCampaign; now: number }) {
  const { locale, t } = useI18n();
  const isFlash = campaign.type === "FLASH";
  const isUpcoming = campaign.phase === "UPCOMING";
  const target = isUpcoming ? campaign.startsAt : campaign.endsAt;
  const countdown = getCountdown(target, now);
  const products = groupSaleItems(campaign.items ?? []);
  const bannerUrl = safeBannerUrl(campaign.bannerUrl);
  const campaignTypeLabel = isFlash
    ? t("storefront.sale.type.flash")
    : t("storefront.sale.type.standard");
  const campaignPhaseLabel =
    campaign.phase === "UPCOMING"
      ? t("storefront.sale.phase.upcoming")
      : campaign.phase === "LIVE"
        ? t("storefront.sale.phase.live")
        : t("storefront.sale.phase.ended");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1c1a18]/8 bg-white shadow-[0_18px_60px_rgba(28,26,24,0.06)]">
      {bannerUrl ? (
        <div
          role="img"
          aria-label={t("storefront.sale.bannerAria", { name: campaign.name })}
          className="h-40 bg-[#e8ded2] bg-cover bg-center md:h-64"
          style={{ backgroundImage: `url(${JSON.stringify(bannerUrl)})` }}
        />
      ) : null}
      <header className="grid gap-6 border-b border-[#1c1a18]/8 bg-[#fbfaf7] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={isFlash ? "bg-[#8f2f20] text-white" : "bg-[#1c1a18] text-white"}>
              {campaignTypeLabel}
            </Badge>
            <Badge variant="outline">{campaignPhaseLabel}</Badge>
            <span className="text-xs text-[#1c1a18]/50">
              {t("storefront.sale.code", { code: campaign.code })}
            </span>
          </div>
          <h2 className="font-serif text-3xl font-light md:text-4xl">{campaign.name}</h2>
          {campaign.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1c1a18]/60">{campaign.description}</p>
          ) : null}
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8f2f20]">
            {isFlash
              ? t("storefront.sale.coupon.flashIneligible")
              : t("storefront.sale.coupon.standardEligible")}
          </p>
        </div>
        <CountdownBlock
          label={
            isUpcoming
              ? t("storefront.sale.countdown.startsIn")
              : t("storefront.sale.countdown.endsIn")
          }
          countdown={countdown}
        />
      </header>

      {products.length === 0 ? (
        <p className="p-8 text-sm text-[#1c1a18]/55">
          {t("storefront.sale.noProducts")}
        </p>
      ) : (
        <div className="grid gap-px bg-[#1c1a18]/8 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const quotaSoldOut =
              isFlash &&
              product.remainingQuota !== null &&
              product.remainingQuota <= 0;
            const soldOut = quotaSoldOut || product.availableQuantity <= 0;
            const soldOutLabel = quotaSoldOut
              ? t("storefront.sale.flashSoldOut")
              : t("storefront.sale.outOfStock");
            const used =
              product.quota !== null && product.remainingQuota !== null
                ? Math.max(0, product.quota - product.remainingQuota)
                : 0;
            const progress = product.quota ? Math.min(100, (used / product.quota) * 100) : 0;

            return (
              <article key={product.productId} className="flex flex-col bg-white p-5">
                <Link
                  href={`/products/${encodeURIComponent(product.productSlug)}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-[#efe7dc]"
                >
                  <FashionImage
                    src={resolveImageUrl(product.image)}
                    alt={product.productName}
                    className={soldOut ? "grayscale" : undefined}
                  />
                  {soldOut ? (
                    <span className="absolute inset-0 grid place-items-center bg-[#1c1a18]/45 text-xs font-bold uppercase tracking-[0.2em] text-white">
                      {soldOutLabel}
                    </span>
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col pt-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#1c1a18]/45">
                    {t("storefront.sale.variantOptions", {
                      count: product.variants.length,
                    })}
                  </p>
                  <Link href={`/products/${encodeURIComponent(product.productSlug)}`}>
                    <h3 className="mt-2 min-h-12 font-serif text-lg leading-6 hover:text-[#b5573a]">
                      {product.productName}
                    </h3>
                  </Link>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-semibold text-[#8f2f20]">
                      {money(product.promotionalPrice, locale)}
                    </span>
                    {product.referencePrice > product.promotionalPrice ? (
                      <span className="text-xs text-[#1c1a18]/35 line-through">
                        {money(product.referencePrice, locale)}
                      </span>
                    ) : null}
                  </div>

                  {isFlash && product.quota !== null ? (
                    <div className="mt-5 space-y-2">
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex items-center justify-between text-[11px] text-[#1c1a18]/55">
                        <span>
                          {t("storefront.sale.quotaRemaining", {
                            remaining: Math.max(0, product.remainingQuota ?? 0),
                            quota: product.quota,
                          })}
                        </span>
                        {product.maxPerCustomer ? (
                          <span className="inline-flex items-center gap-1">
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
                      render={<Link href={`/products/${encodeURIComponent(product.productSlug)}`} />}
                      nativeButton={false}
                      className="mt-6 w-full bg-[#1c1a18] text-white hover:bg-[#b5573a]"
                    >
                      {t("storefront.sale.selectVariant")}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="mt-6 w-full bg-[#1c1a18]/20 text-white"
                    >
                      {isUpcoming ? t("storefront.sale.upcoming") : soldOutLabel}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function safeBannerUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function CountdownBlock({ label, countdown }: { label: string; countdown: ReturnType<typeof getCountdown> }) {
  const { t } = useI18n();
  const values = [
    [countdown.days, t("storefront.sale.countdown.days")],
    [countdown.hours, t("storefront.sale.countdown.hours")],
    [countdown.minutes, t("storefront.sale.countdown.minutes")],
    [countdown.seconds, t("storefront.sale.countdown.seconds")],
  ] as const;

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1c1a18]/45">{label}</p>
      <div className="flex gap-2">
        {values.map(([value, unit]) => (
          <div key={unit} className="min-w-14 rounded-lg border border-[#1c1a18]/10 bg-white px-2 py-2 text-center">
            <strong className="block font-mono text-lg tabular-nums">{String(value).padStart(2, "0")}</strong>
            <span className="text-[9px] uppercase tracking-wider text-[#1c1a18]/45">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaleLoading() {
  const { t } = useI18n();

  return (
    <div className="space-y-8" aria-label={t("storefront.sale.loadingAria")}>
      {[0, 1].map((item) => (
        <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-[#1c1a18]/8 bg-white">
          <div className="h-36 bg-[#efe7dc]" />
          <div className="grid grid-cols-2 gap-px bg-[#1c1a18]/5 lg:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="h-80 bg-white p-5">
                <div className="h-52 bg-[#efe7dc]" />
                <div className="mt-5 h-4 w-3/4 bg-[#efe7dc]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
