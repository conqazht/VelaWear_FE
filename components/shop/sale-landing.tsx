"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { AlarmClock, BadgePercent, ShoppingBag } from "lucide-react";

import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { ProductGrid } from "@/components/shop/product-layout-components";
import { ProductCardSkeletonGrid } from "@/components/shop/product-skeletons";
import { SaleProductCard } from "@/components/shop/sale-product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SaleCampaign, SaleCampaignType } from "@/lib/api/types";
import { usePublicSalesQuery, saleQueryKeys } from "@/lib/queries/sales";
import {
  getCountdown,
  getServerClockOffset,
  groupSaleItems,
} from "@/lib/sale-utils";

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

  if (salesQuery.isError && !salesQuery.data) {
    return (
      <StorefrontApiStatus
        error={salesQuery.error}
        onRetry={() => void salesQuery.refetch()}
        resourceLabel={isFlash ? t("storefront.sale.flash.title") : t("storefront.sale.standard.title")}
        returnHref="/collection"
        returnLabel={t("storefront.sale.continueShopping")}
        variant="route"
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] pb-24 pt-[104px] text-[#1c1a18] md:pt-[120px]">
      <div className="mx-auto w-full max-w-[1800px] px-6 md:px-16">
        <nav
          aria-label={t("storefront.common.home")}
          className="mb-4 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50"
        >
          <Link href="/" className="transition-colors hover:text-[#1c1a18]">
            {t("storefront.common.home")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#1c1a18]">
            {isFlash
              ? t("storefront.sale.flash.title")
              : t("storefront.sale.standard.title")}
          </span>
        </nav>

        <header className="mb-12 grid gap-8 border-b border-[#1c1a18]/10 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b5573a]">
              {isFlash ? (
                <AlarmClock className="size-3.5" />
              ) : (
                <BadgePercent className="size-3.5" />
              )}
              {isFlash
                ? t("storefront.sale.flash.eyebrow")
                : t("storefront.sale.standard.eyebrow")}
            </div>
            <h1 className="font-serif text-3xl font-light tracking-wide md:text-5xl">
              {isFlash
                ? t("storefront.sale.flash.title")
                : t("storefront.sale.standard.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#1c1a18]/60 md:text-base md:leading-7">
              {isFlash
                ? t("storefront.sale.flash.description")
                : t("storefront.sale.standard.description")}
            </p>
          </div>

          <nav
            aria-label={`${t("storefront.sale.standard.title")} / ${t("storefront.sale.flash.title")}`}
            className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            <Link
              href="/sale"
              aria-label={t("storefront.sale.viewStandard")}
              aria-current={!isFlash ? "page" : undefined}
              className={
                !isFlash
                  ? "border-b border-[#1c1a18] pb-2 text-[#1c1a18]"
                  : "border-b border-transparent pb-2 text-[#1c1a18]/45 transition-colors hover:text-[#1c1a18]"
              }
            >
              {t("storefront.sale.standard.title")}
            </Link>
            <Link
              href="/flash-sale"
              aria-label={t("storefront.sale.viewFlash")}
              aria-current={isFlash ? "page" : undefined}
              className={
                isFlash
                  ? "border-b border-[#1c1a18] pb-2 text-[#1c1a18]"
                  : "border-b border-transparent pb-2 text-[#1c1a18]/45 transition-colors hover:text-[#1c1a18]"
              }
            >
              {t("storefront.sale.flash.title")}
            </Link>
          </nav>
        </header>

        <div className="space-y-16">
          {salesQuery.isLoading ? <SaleLoading /> : null}

          {salesQuery.isError ? (
            <StorefrontStaleWarning
              resourceLabel={isFlash ? t("storefront.sale.flash.title") : t("storefront.sale.standard.title")}
              onRetry={() => void salesQuery.refetch()}
              error={salesQuery.error}
            />
          ) : null}

          {!salesQuery.isLoading && !salesQuery.isError && campaigns.length === 0 ? (
            <section className="grid min-h-[440px] place-items-center border-y border-[#1c1a18]/10 py-20 text-center">
              <div>
                <ShoppingBag className="mx-auto mb-5 size-10 text-[#1c1a18]/25" />
                <h2 className="font-serif text-2xl">
                  {t("storefront.sale.empty.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#1c1a18]/55">
                  {t("storefront.sale.empty.description")}
                </p>
                <Button
                  render={<Link href="/collection" />}
                  nativeButton={false}
                  className="mt-7 rounded-sm bg-[#1c1a18] text-white hover:bg-[#b5573a]"
                >
                  {t("storefront.sale.continueShopping")}
                </Button>
              </div>
            </section>
          ) : null}

          {campaigns.map((campaign) => (
            <CampaignSection key={campaign.id} campaign={campaign} now={now} />
          ))}
        </div>
      </div>
    </main>
  );
}

function CampaignSection({ campaign, now }: { campaign: SaleCampaign; now: number }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
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
    <section className="border-b border-[#1c1a18]/10 pb-16 last:border-b-0 last:pb-0">
      {bannerUrl ? (
        <motion.div
          initial={{ clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          role="img"
          aria-label={t("storefront.sale.bannerAria", { name: campaign.name })}
          className="mb-8 h-40 overflow-hidden rounded-lg bg-[#e8ded2] bg-cover bg-center md:h-64"
          style={{ backgroundImage: `url(${JSON.stringify(bannerUrl)})` }}
        />
      ) : null}
      <header className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge
              className={
                isFlash
                  ? "rounded-sm bg-[#8f2f20] text-white"
                  : "rounded-sm bg-[#1c1a18] text-white"
              }
            >
              {campaignTypeLabel}
            </Badge>
            <Badge variant="outline" className="rounded-sm">
              {campaignPhaseLabel}
            </Badge>
            <span className="text-xs text-[#1c1a18]/50">
              {t("storefront.sale.code", { code: campaign.code })}
            </span>
          </div>
          <h2 className="text-balance font-serif text-3xl font-light md:text-4xl">
            {campaign.name}
          </h2>
          {campaign.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1c1a18]/60">
              {campaign.description}
            </p>
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
        <p className="border-y border-[#1c1a18]/10 py-16 text-center text-sm text-[#1c1a18]/55">
          {t("storefront.sale.noProducts")}
        </p>
      ) : (
        <ProductGrid>
          {products.map((product, index) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.15 : 0.35,
                delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.4),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <SaleProductCard
                product={product}
                isFlash={isFlash}
                isUpcoming={isUpcoming}
              />
            </motion.div>
          ))}
        </ProductGrid>
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
    <div
      className="space-y-16"
      aria-label={t("storefront.sale.loadingAria")}
      role="status"
    >
      {[0, 1].map((item) => (
        <section
          key={item}
          className="border-b border-[#1c1a18]/10 pb-16 last:border-b-0"
        >
          <div className="mb-8 animate-pulse">
            <div className="h-3 w-28 bg-[#efe7dc]" />
            <div className="mt-4 h-9 w-full max-w-md bg-[#efe7dc]" />
            <div className="mt-4 h-4 w-full max-w-xl bg-[#efe7dc]" />
          </div>
          <ProductCardSkeletonGrid
            count={6}
            imageAspect="square"
            gridClassName="grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          />
        </section>
      ))}
    </div>
  );
}
