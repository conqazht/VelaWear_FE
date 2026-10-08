"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarClock,
  Check,
  Copy,
  Crown,
  History,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { Skeleton } from "@/components/ui/skeleton";
import { createSignInHref } from "@/lib/auth/post-auth-redirect";
import { useMyCouponsQuery } from "@/lib/queries/commerce";
import type { Coupon, CustomerTier } from "@/lib/api/types";
import { money } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

const TIER_RANK: Record<string, number> = {
  STANDARD: 0,
  SILVER: 1,
  GOLD: 2,
  DIAMOND: 3,
};

const getTierLabel = (
  tier: string | CustomerTier | undefined | null,
  t: ReturnType<typeof useI18n>["t"],
) => {
  switch (tier?.toUpperCase()) {
    case "SILVER":
      return t("coupons.tier.silver");
    case "GOLD":
      return t("coupons.tier.gold");
    case "DIAMOND":
      return t("coupons.tier.diamond");
    default:
      return t("coupons.tier.standard");
  }
};

const formatCouponValue = (coupon: Coupon, locale: Locale) =>
  coupon.type.includes("PERCENT") ? `${coupon.value}%` : money(Number(coupon.value || 0), locale);

const getUsagePercentage = (coupon: Coupon) => {
  if (!coupon.usageLimit || coupon.usageLimit <= 0) return null;
  return Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));
};

interface CouponTicketCardProps {
  coupon: Coupon;
  userTier?: CustomerTier;
  locale: Locale;
  isCopied: boolean;
  onCopy: (code: string) => void;
  t: ReturnType<typeof useI18n>["t"];
}

function CouponTicketCard({
  coupon,
  userTier = "STANDARD",
  locale,
  isCopied,
  onCopy,
  t,
}: CouponTicketCardProps) {
  const usagePercentage = getUsagePercentage(coupon);
  const isPercent = coupon.type.includes("PERCENT");
  const requiredTier = coupon.minTier ?? "STANDARD";
  const isVipCoupon = requiredTier !== "STANDARD";
  const userRank = TIER_RANK[userTier] ?? 0;
  const couponRank = TIER_RANK[requiredTier] ?? 0;
  const isTierEligible = userRank >= couponRank;

  const tierBadgeClasses =
    {
      SILVER: "border-slate-300 bg-slate-100 text-slate-800",
      GOLD: "border-amber-300 bg-amber-50 text-amber-800",
      DIAMOND: "border-purple-300 bg-purple-50 text-purple-800",
    }[requiredTier] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-shadow hover:shadow-md",
        !isTierEligible ? "border-zinc-200/80 bg-zinc-50/50 opacity-90" : "border-[#1c1a18]/10",
      )}
    >
      {/* Top Section: Benefit & Conditions */}
      <div className="p-6 pb-5 md:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
              {isPercent ? t("coupons.type.percentage") : t("coupons.type.fixed")}
            </span>
            {isVipCoupon && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                  tierBadgeClasses,
                )}
              >
                <Crown className="size-2.5" />
                {getTierLabel(requiredTier, t)}
              </span>
            )}
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase",
              coupon.status.toUpperCase() === "ACTIVE"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[#1c1a18]/10 bg-[#1c1a18]/5 text-[#1c1a18]/60",
            )}
          >
            {{
              ACTIVE: t("coupons.status.available"),
              INACTIVE: t("coupons.status.inactive"),
              EXPIRED: t("coupons.status.expired"),
            }[coupon.status.toUpperCase()] ?? coupon.status}
          </span>
        </div>

        {/* Hero Discount Value */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="font-serif text-3xl font-normal tracking-tight text-[#1c1a18] md:text-4xl">
            {formatCouponValue(coupon, locale)}
          </span>
          <span className="text-xs font-bold tracking-widest text-[#b5573a] uppercase">
            {isPercent ? "OFF" : "GIẢM"}
          </span>
        </div>

        {/* Conditions */}
        <div className="space-y-1.5 text-xs text-[#55423d]/75">
          <p className="flex items-center gap-2">
            <span className="size-1 shrink-0 rounded-full bg-[#b5573a]/60" />
            <span>
              {t("coupons.minimum", {
                amount: money(Number(coupon.minOrderAmount ?? 0), locale),
              })}
            </span>
          </p>
          {coupon.maxDiscount ? (
            <p className="flex items-center gap-2">
              <span className="size-1 shrink-0 rounded-full bg-[#b5573a]/60" />
              <span>
                {t("coupons.maximum", {
                  amount: money(Number(coupon.maxDiscount), locale),
                })}
              </span>
            </p>
          ) : null}
          {isVipCoupon && !isTierEligible && (
            <p className="flex items-center gap-2 font-medium text-amber-800">
              <Lock className="size-3 shrink-0 text-amber-600" />
              <span>
                {t("coupons.tier.requires", {
                  tier: getTierLabel(requiredTier, t),
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Perforated Ticket Divider */}
      <div className="relative flex items-center px-4">
        <div className="bg-canvas absolute -left-3 size-6 rounded-full border-r border-[#1c1a18]/10" />
        <div className="w-full border-t border-dashed border-[#1c1a18]/15" />
        <div className="bg-canvas absolute -right-3 size-6 rounded-full border-l border-[#1c1a18]/10" />
      </div>

      {/* Bottom Section: Code Box & Validity Meta */}
      <div className="flex flex-col gap-4 bg-[#fcfbfa]/80 p-6 pt-5 md:p-7">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#1c1a18]/25 bg-white p-2 pl-3">
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate font-mono text-sm font-bold tracking-wider select-all md:text-base",
                isTierEligible ? "text-[#1c1a18]" : "text-zinc-400 blur-[0.5px]",
              )}
            >
              {coupon.code}
            </span>
          </div>

          {isTierEligible ? (
            <button
              type="button"
              onClick={() => onCopy(coupon.code)}
              aria-label={
                isCopied
                  ? t("coupons.copied", { code: coupon.code })
                  : t("coupons.copyCode", { code: coupon.code })
              }
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all active:scale-[0.96]",
                isCopied
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-[#1c1a18] bg-[#1c1a18] text-white shadow-xs hover:border-[#b5573a] hover:bg-[#b5573a]",
              )}
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5" strokeWidth={2.5} />
                  <span>{t("coupons.copied", { code: "" }).trim() || "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" strokeWidth={2} />
                  <span>{t("coupons.copyAction")}</span>
                </>
              )}
            </button>
          ) : (
            <div
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800"
              title={t("coupons.tier.requires", {
                tier: getTierLabel(requiredTier, t),
              })}
            >
              <Lock className="size-3 text-amber-700" />
              <span>
                {t("coupons.tier.locked", {
                  tier: getTierLabel(requiredTier, t),
                })}
              </span>
            </div>
          )}
        </div>

        {/* Progress or Limit Info */}
        {usagePercentage !== null && (
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] text-[#55423d]/65">
              <span>{t("coupons.usedPercentage", { percentage: usagePercentage })}</span>
              <span>
                {coupon.usedCount}/{coupon.usageLimit}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1c1a18]/10">
              <div
                className="h-full rounded-full bg-[#b5573a] transition-all"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Validity Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1c1a18]/8 pt-3 text-[11px] text-[#55423d]/70">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-[#b5573a]" />
            <span>
              {coupon.endDate
                ? t("coupons.expires", {
                    date: formatDate(coupon.endDate, locale),
                  })
                : t("coupons.noExpiry")}
            </span>
          </div>

          {isTierEligible && (
            <Link
              href="/collection"
              className="inline-flex items-center gap-1 font-semibold text-[#b5573a] hover:underline"
            >
              <span>{t("reviews.shopNow")}</span>
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberLockGate({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      {/* Elevated Hero Card */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-[#1c1a18]/10 bg-gradient-to-b from-white via-white to-[#fbf8f3] p-8 shadow-sm md:p-14">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#b5573a]/10 text-[#b5573a] md:size-20">
          <Crown className="size-8 md:size-10" strokeWidth={1.5} />
        </div>

        <span className="mb-3 inline-block rounded-full border border-[#b5573a]/25 bg-[#b5573a]/5 px-3.5 py-1 text-[11px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
          {t("coupons.lock.badge")}
        </span>

        <h2 className="mx-auto max-w-2xl font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-4xl">
          {t("coupons.lock.title")}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#55423d]/80 md:text-base">
          {t("coupons.lock.description")}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href={createSignInHref("/coupons")}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#1c1a18] bg-[#1c1a18] px-8 py-3 text-sm font-semibold tracking-wider text-white shadow-sm transition-all hover:border-[#b5573a] hover:bg-[#b5573a] sm:w-auto"
          >
            <Lock className="size-4" />
            <span>{t("coupons.lock.signIn")}</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#1c1a18]/15 bg-white px-8 py-3 text-sm font-semibold tracking-wider text-[#1c1a18] transition-all hover:bg-[#f7f4ef] sm:w-auto"
          >
            <span>{t("coupons.lock.register")}</span>
          </Link>
        </div>

        {/* 3 Pillars of Membership */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[#1c1a18]/10 pt-10 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-[#1c1a18]/5 bg-white/70 p-5">
            <div className="mb-2.5 flex size-8 items-center justify-center rounded-lg bg-[#b5573a]/10 text-[#b5573a]">
              <Sparkles className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#1c1a18]">
              {t("coupons.lock.benefit1.title")}
            </h3>
            <p className="mt-1 text-xs text-[#55423d]/70">{t("coupons.lock.benefit1.desc")}</p>
          </div>

          <div className="rounded-xl border border-[#1c1a18]/5 bg-white/70 p-5">
            <div className="mb-2.5 flex size-8 items-center justify-center rounded-lg bg-[#b5573a]/10 text-[#b5573a]">
              <TrendingUp className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#1c1a18]">
              {t("coupons.lock.benefit2.title")}
            </h3>
            <p className="mt-1 text-xs text-[#55423d]/70">{t("coupons.lock.benefit2.desc")}</p>
          </div>

          <div className="rounded-xl border border-[#1c1a18]/5 bg-white/70 p-5">
            <div className="mb-2.5 flex size-8 items-center justify-center rounded-lg bg-[#b5573a]/10 text-[#b5573a]">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#1c1a18]">
              {t("coupons.lock.benefit3.title")}
            </h3>
            <p className="mt-1 text-xs text-[#55423d]/70">{t("coupons.lock.benefit3.desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembershipTierCard({
  tier = "STANDARD",
  spentAmount = 0,
  nextTier,
  amountToNextTier = 0,
  cycleDays = 180,
  locale,
  t,
}: {
  tier?: CustomerTier;
  spentAmount?: number;
  nextTier?: CustomerTier | null;
  amountToNextTier?: number;
  cycleDays?: number;
  locale: Locale;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const tierStyle = {
    STANDARD: {
      badgeBg: "bg-zinc-100 text-zinc-800 border-zinc-300",
      iconColor: "text-zinc-600",
      accentBg: "from-zinc-50 to-white",
      border: "border-zinc-200",
    },
    SILVER: {
      badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
      iconColor: "text-slate-600",
      accentBg: "from-slate-50 via-zinc-50 to-white",
      border: "border-slate-300",
    },
    GOLD: {
      badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
      iconColor: "text-amber-600",
      accentBg: "from-amber-50/60 via-yellow-50/30 to-white",
      border: "border-amber-200",
    },
    DIAMOND: {
      badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
      iconColor: "text-purple-600",
      accentBg: "from-purple-50/60 via-indigo-50/30 to-white",
      border: "border-purple-200",
    },
  }[tier] ?? {
    badgeBg: "bg-zinc-100 text-zinc-800 border-zinc-300",
    iconColor: "text-zinc-600",
    accentBg: "from-zinc-50 to-white",
    border: "border-zinc-200",
  };

  const nextTierThreshold = spentAmount + amountToNextTier;
  const progressPercent =
    nextTier && nextTierThreshold > 0
      ? Math.min(100, Math.round((spentAmount / nextTierThreshold) * 100))
      : 100;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs md:p-8",
        tierStyle.accentBg,
        tierStyle.border,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Tier Info Left */}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs">
            <Crown className={cn("size-6", tierStyle.iconColor)} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
                {t("coupons.lock.badge")}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                  tierStyle.badgeBg,
                )}
              >
                {getTierLabel(tier, t)}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-xl font-medium tracking-tight text-[#1c1a18] md:text-2xl">
              {t("coupons.tier.current", { tier: getTierLabel(tier, t) })}
            </h2>
            <p className="mt-1 text-xs text-[#55423d]/75">
              {t("coupons.tier.cycleSpend", { amount: money(spentAmount, locale) })} (Chu kỳ{" "}
              {cycleDays} ngày)
            </p>
          </div>
        </div>

        {/* Progress or Highest Tier Right */}
        <div className="w-full max-w-sm">
          {nextTier ? (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#1c1a18]">
                <span>
                  {t("coupons.tier.next", {
                    amount: money(amountToNextTier, locale),
                    tier: getTierLabel(nextTier, t),
                  })}
                </span>
                <span className="font-semibold text-[#b5573a]">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c1a18]/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#b5573a] to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white/80 p-3 text-xs text-purple-900">
              <Award className="size-5 shrink-0 text-purple-600" />
              <span>{t("coupons.tier.highest")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CouponsClient() {
  const { locale, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "vip" | "public" | "history">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const myCouponsQuery = useMyCouponsQuery(isAuthenticated);
  const myCouponsData = myCouponsQuery.data;
  const availableCoupons = myCouponsData?.availableCoupons ?? [];
  const usageHistory = myCouponsData?.usageHistory ?? [];
  const userTier = myCouponsData?.membershipTier ?? "STANDARD";

  const totalSaved = useMemo(
    () => usageHistory.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0),
    [usageHistory],
  );

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        setCopiedCode(code);
        setTimeout(() => {
          setCopiedCode((current) => (current === code ? null : current));
        }, 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  // Filter coupons based on tab
  const filteredCoupons = useMemo(() => {
    if (activeTab === "vip") {
      return availableCoupons.filter((c) => c.minTier && c.minTier !== "STANDARD");
    }
    if (activeTab === "public") {
      return availableCoupons.filter((c) => !c.minTier || c.minTier === "STANDARD");
    }
    return availableCoupons;
  }, [availableCoupons, activeTab]);

  if (isAuthLoading) {
    return <CouponsPageLoading />;
  }

  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        {/* If guest: Show Member Exclusive Lock State */}
        {!isAuthenticated ? (
          <MemberLockGate t={t} />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
              <div>
                <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
                  {t("coupons.lock.badge")}
                </p>
                <h1 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
                  {t("coupons.title")}
                </h1>
              </div>
              <span className="text-xs text-[#55423d]/65">
                {t("coupons.availableCount", { count: availableCoupons.length })}
              </span>
            </div>

            {/* Error or Stale State */}
            {myCouponsQuery.isError && (
              <StorefrontApiStatus
                error={myCouponsQuery.error}
                resourceLabel={t("coupons.resource")}
                onRetry={() => void myCouponsQuery.refetch()}
              />
            )}
            {myCouponsQuery.isStale && !myCouponsQuery.isError && (
              <StorefrontStaleWarning
                resourceLabel={t("coupons.resource")}
                onRetry={() => void myCouponsQuery.refetch()}
                error={myCouponsQuery.error}
              />
            )}

            {/* Membership Tier Card */}
            <MembershipTierCard
              tier={userTier}
              spentAmount={myCouponsData?.tierSpentAmount}
              nextTier={myCouponsData?.nextTier}
              amountToNextTier={myCouponsData?.amountToNextTier}
              cycleDays={myCouponsData?.cycleDays}
              locale={locale}
              t={t}
            />

            {/* Stat Highlights */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <CouponStat
                label={t("coupons.stat.available")}
                value={String(availableCoupons.length)}
                icon={<Ticket className="size-4" />}
              />
              <CouponStat
                label={t("coupons.stat.used")}
                value={String(usageHistory.length)}
                icon={<Check className="size-4" />}
              />
              <CouponStat
                label={t("coupons.stat.saved")}
                value={money(totalSaved, locale)}
                icon={<PiggyBank className="size-4" />}
              />
              <CouponStat
                label={t("coupons.stat.expiring")}
                value={String(availableCoupons.filter((c) => Boolean(c.endDate)).length)}
                icon={<CalendarClock className="size-4" />}
              />
            </div>

            {/* Filter Tabs */}
            <div
              role="tablist"
              aria-label={t("coupons.title")}
              className="flex items-center gap-6 overflow-x-auto border-b border-[#1c1a18]/10"
            >
              <button
                type="button"
                role="tab"
                id="tab-all"
                aria-selected={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                className={cn(
                  "relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium tracking-wide transition-colors",
                  activeTab === "all"
                    ? "font-semibold text-[#1c1a18] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b5573a]"
                    : "text-[#1c1a18]/55 hover:text-[#1c1a18]",
                )}
              >
                {t("coupons.tab.all")}
                <span className="ml-2 rounded-full bg-[#1c1a18]/5 px-2 py-0.5 text-xs font-normal text-[#55423d]/70">
                  {availableCoupons.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-vip"
                aria-selected={activeTab === "vip"}
                onClick={() => setActiveTab("vip")}
                className={cn(
                  "relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium tracking-wide transition-colors",
                  activeTab === "vip"
                    ? "font-semibold text-[#1c1a18] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b5573a]"
                    : "text-[#1c1a18]/55 hover:text-[#1c1a18]",
                )}
              >
                {t("coupons.tab.vip")}
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800">
                  {availableCoupons.filter((c) => c.minTier && c.minTier !== "STANDARD").length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-public"
                aria-selected={activeTab === "public"}
                onClick={() => setActiveTab("public")}
                className={cn(
                  "relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium tracking-wide transition-colors",
                  activeTab === "public"
                    ? "font-semibold text-[#1c1a18] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b5573a]"
                    : "text-[#1c1a18]/55 hover:text-[#1c1a18]",
                )}
              >
                {t("coupons.tab.public")}
                <span className="ml-2 rounded-full bg-[#1c1a18]/5 px-2 py-0.5 text-xs font-normal text-[#55423d]/70">
                  {availableCoupons.filter((c) => !c.minTier || c.minTier === "STANDARD").length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-history"
                aria-selected={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                className={cn(
                  "relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium tracking-wide transition-colors",
                  activeTab === "history"
                    ? "font-semibold text-[#1c1a18] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b5573a]"
                    : "text-[#1c1a18]/55 hover:text-[#1c1a18]",
                )}
              >
                {t("coupons.history")}
                <span className="ml-2 rounded-full bg-[#1c1a18]/5 px-2 py-0.5 text-xs font-normal text-[#55423d]/70">
                  {usageHistory.length}
                </span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "history" ? (
              <section className="flex flex-col gap-6 text-left">
                {usageHistory.length === 0 ? (
                  <div className="rounded-md border border-[#1c1a18]/5 bg-white py-14 text-center">
                    <History className="mx-auto mb-4 size-9 text-[#1c1a18]/20" strokeWidth={1.25} />
                    <p className="text-sm text-[#1c1a18]/55">{t("coupons.noHistory")}</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-[#1c1a18]/10 bg-white">
                    {usageHistory.map((usage) => (
                      <Link
                        key={usage.id}
                        href={`/profile/orders/${usage.orderCode}`}
                        className="flex flex-col gap-4 border-b border-[#1c1a18]/8 px-6 py-5 transition-colors last:border-b-0 hover:bg-[#f7f4ef]/70 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-[#1c1a18]">
                              {usage.coupon.code}
                            </span>
                            <span className="rounded-sm bg-[#b5573a]/10 px-2 py-1 text-[9px] font-bold tracking-wider text-[#8f4329] uppercase">
                              {t("coupons.usedBadge")}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-[#1c1a18]/55">
                            {t("coupons.order", {
                              code: usage.orderCode,
                              date: formatDate(usage.usedAt, locale),
                            })}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-semibold tracking-wider text-[#1c1a18]/45 uppercase">
                            {t("coupons.discount")}
                          </p>
                          <p className="font-numeric mt-1 text-base font-semibold text-emerald-700">
                            −{money(Number(usage.discountAmount || 0), locale)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ) : myCouponsQuery.isLoading ? (
              <CouponsLoadingSkeleton />
            ) : filteredCoupons.length === 0 ? (
              <div className="rounded-2xl border border-[#1c1a18]/8 bg-white py-16 text-center">
                <Ticket className="mx-auto mb-4 size-10 text-[#1c1a18]/25" strokeWidth={1.5} />
                <h3 className="font-serif text-xl font-normal text-[#1c1a18]">
                  {t("coupons.emptyTitle")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs text-[#55423d]/70">
                  {t("coupons.emptyDescription")}
                </p>
                <div className="mt-6">
                  <Link
                    href="/collection"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#1c1a18] bg-[#1c1a18] px-6 py-2.5 text-xs font-semibold tracking-wider text-white transition-all hover:bg-[#b5573a]"
                  >
                    <span>{t("coupons.explore")}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCoupons.map((coupon) => (
                  <CouponTicketCard
                    key={coupon.id}
                    coupon={coupon}
                    userTier={userTier}
                    locale={locale}
                    isCopied={copiedCode === coupon.code}
                    onCopy={handleCopyCode}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function CouponStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-[#1c1a18]/8 bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between text-[#b5573a]">
        <span className="text-[10px] font-bold tracking-[0.16em] text-[#1c1a18]/45 uppercase">
          {label}
        </span>
        {icon}
      </div>
      <p className="font-serif text-xl font-medium text-[#1c1a18] md:text-2xl">{value}</p>
    </div>
  );
}

function CouponsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1c1a18]/8 bg-white p-6 md:p-7"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-20 bg-[#efe7dc]" />
              <Skeleton className="h-3.5 w-16 bg-[#efe7dc]" />
            </div>
            <Skeleton className="h-10 w-32 bg-[#efe7dc]" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-40 bg-[#efe7dc]" />
              <Skeleton className="h-3 w-32 bg-[#efe7dc]" />
            </div>
          </div>
          <div className="mt-8 border-t border-[#1c1a18]/5 pt-4">
            <Skeleton className="h-8 w-full rounded-xl bg-[#efe7dc]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CouponsPageLoading() {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <section className="flex flex-col gap-6 text-left" aria-hidden="true">
          <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
            <Skeleton className="h-8 w-40 bg-[#efe7dc] md:h-9 md:w-52" />
            <Skeleton className="h-3 w-16 bg-[#efe7dc]" />
          </div>
          <CouponsLoadingSkeleton />
        </section>
      </main>
    </div>
  );
}
