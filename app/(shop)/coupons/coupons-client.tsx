"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CalendarClock, History, PiggyBank, Ticket } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCouponsQuery } from "@/lib/queries/commerce";
import type { Coupon } from "@/lib/api/types";
import { money } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/format";

const formatCouponValue = (coupon: Coupon, locale: Locale) =>
  coupon.type.includes("PERCENT")
    ? `${coupon.value}%`
    : money(Number(coupon.value || 0), locale);

const getUsagePercentage = (coupon: Coupon) => {
  if (!coupon.usageLimit || coupon.usageLimit <= 0) return null;
  return Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));
};

export function CouponsClient() {
  const { locale, t } = useI18n();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const couponsQuery = useMyCouponsQuery(isAuthenticated);
  const coupons = couponsQuery.data?.availableCoupons ?? [];
  const usageHistory = couponsQuery.data?.usageHistory ?? [];
  const [referenceTime] = useState(() => Date.now());
  const totalSavings = usageHistory.reduce(
    (total, usage) => total + Number(usage.discountAmount || 0),
    0
  );
  const expiringSoon = coupons.filter((coupon) => {
    if (!coupon.endDate) return false;
    const remaining = new Date(coupon.endDate).getTime() - referenceTime;
    return remaining >= 0 && remaining <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (isAuthLoading) {
    return <CouponsPageLoading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-canvas text-ink min-h-[100dvh] pt-[120px] px-6 flex items-center justify-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[#1c1a18]/60">{t("coupons.signIn")}</p>
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">
        <section className="flex flex-col gap-6 text-left">
          <div className="border-b border-[#1c1a18]/10 pb-4 flex justify-between items-end">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
              {t("coupons.title")}
            </h2>
            <span className="text-xs text-[#55423d]/65">
              {t("coupons.availableCount", { count: coupons.length })}
            </span>
          </div>

          {couponsQuery.isLoading ? (
            <CouponStatsLoadingSkeleton />
          ) : !couponsQuery.isError && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <CouponStat label={t("coupons.stat.available")} value={coupons.length.toString()} icon={<Ticket className="size-4" />} />
              <CouponStat label={t("coupons.stat.used")} value={usageHistory.length.toString()} icon={<History className="size-4" />} />
              <CouponStat label={t("coupons.stat.saved")} value={money(totalSavings, locale)} icon={<PiggyBank className="size-4" />} />
              <CouponStat label={t("coupons.stat.expiring")} value={expiringSoon.toString()} icon={<CalendarClock className="size-4" />} />
            </div>
          )}

        {couponsQuery.isError ? (
          <StorefrontApiStatus
            error={couponsQuery.error}
            onRetry={() => void couponsQuery.refetch()}
            resourceLabel={t("coupons.resource")}
            returnHref="/collection"
            variant="panel"
          />
        ) : couponsQuery.isLoading ? (
          <CouponsLoadingSkeleton />
        ) : coupons.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1c1a18]/5 rounded-md shadow-sm">
            <Ticket className="w-12 h-12 text-[#1c1a18]/20 mb-6" strokeWidth={1} />
            <h2 className="font-serif text-2xl text-[#1c1a18] font-light mb-3">{t("coupons.emptyTitle")}</h2>
            <p className="text-sm text-[#1c1a18]/60 max-w-md mx-auto">
              {t("coupons.emptyDescription")}
            </p>
            <Link href="/" className="mt-8 px-8 py-3.5 bg-[#1c1a18] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#b85a3c] transition-colors">
              {t("coupons.explore")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const usagePercentage = getUsagePercentage(coupon);
              return (
                <div
                  key={coupon.id}
                  className="group relative bg-white border border-[#1c1a18]/10 rounded-md p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#f7f4ef] rounded-full -translate-y-1/2 border-r border-[#1c1a18]/10"></div>
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#f7f4ef] rounded-full -translate-y-1/2 border-l border-[#1c1a18]/10"></div>
                <div className="absolute top-1/2 left-6 right-6 h-px bg-transparent border-t border-dashed border-[#1c1a18]/15 -translate-y-1/2"></div>

                <div className="pb-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b85a3c]">
                      {coupon.type.includes("PERCENT") ? t("coupons.type.percentage") : t("coupons.type.fixed")}
                    </p>
                    <span className="rounded-sm bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                      {{
                        ACTIVE: t("coupons.status.available"),
                        INACTIVE: t("coupons.status.inactive"),
                        EXPIRED: t("coupons.status.expired"),
                      }[coupon.status.toUpperCase()] ?? coupon.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18]">
                    {coupon.code}
                  </h3>
                </div>

                <div className="pt-8 flex flex-col gap-1 relative z-10">
                  <p className="text-3xl font-semibold text-[#1c1a18] font-numeric mb-2">
                    {formatCouponValue(coupon, locale)}
                  </p>
                  <p className="text-xs text-[#1c1a18]/60">
                    {t("coupons.minimum", { amount: money(Number(coupon.minOrderAmount ?? 0), locale) })}
                  </p>
                  {coupon.maxDiscount && (
                    <p className="text-xs text-[#1c1a18]/60">
                      {t("coupons.maximum", { amount: money(Number(coupon.maxDiscount), locale) })}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3 text-[11px] text-[#1c1a18]/50 font-medium">
                    <p>{t("coupons.expires", { date: coupon.endDate ? formatDate(coupon.endDate, locale) : t("coupons.noExpiry") })}</p>
                    <p>
                      {usagePercentage === null
                        ? t("coupons.unlimited")
                        : t("coupons.usedPercentage", { percentage: usagePercentage })}
                    </p>
                  </div>
                  {usagePercentage !== null && (
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1c1a18]/8"
                      role="progressbar"
                      aria-label={t("coupons.usageLabel", { code: coupon.code })}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={usagePercentage}
                    >
                      <div
                        className="h-full rounded-full bg-[#b85a3c] transition-[width] duration-500"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
        </section>

        {!couponsQuery.isLoading && !couponsQuery.isError && (
          <section className="flex flex-col gap-6 text-left">
            <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b85a3c]">
                  {t("coupons.recent")}
                </p>
                <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
                  {t("coupons.history")}
                </h2>
              </div>
              <span className="text-xs text-[#55423d]/65">{t("coupons.historyCount", { count: usageHistory.length })}</span>
            </div>

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
                        <span className="font-mono text-sm font-semibold text-[#1c1a18]">{usage.coupon.code}</span>
                        <span className="rounded-sm bg-[#b85a3c]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#9e452c]">
                          {t("coupons.usedBadge")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#1c1a18]/55">
                        {t("coupons.order", { code: usage.orderCode, date: formatDate(usage.usedAt, locale) })}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1c1a18]/45">{t("coupons.discount")}</p>
                      <p className="mt-1 font-numeric text-base font-semibold text-emerald-700">
                        −{money(Number(usage.discountAmount || 0), locale)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function CouponStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-[#1c1a18]/8 bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between text-[#b85a3c]">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1c1a18]/45">{label}</span>
        {icon}
      </div>
      <p className="font-serif text-xl font-medium text-[#1c1a18] md:text-2xl">{value}</p>
    </div>
  );
}

function CouponsPageLoading() {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-10 md:px-16 md:py-16">
        <section className="flex flex-col gap-6 text-left" aria-hidden="true">
          <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
            <Skeleton className="h-8 w-40 bg-[#efe7dc] md:h-9 md:w-52" />
            <Skeleton className="h-3 w-16 bg-[#efe7dc]" />
          </div>
          <CouponStatsLoadingSkeleton />
          <CouponsLoadingSkeleton />
        </section>
      </main>
    </div>
  );
}

function CouponStatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-md border border-[#1c1a18]/8 bg-white p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-2.5 w-16 bg-[#efe7dc]" />
            <Skeleton className="size-4 rounded-full bg-[#efe7dc]" />
          </div>
          <Skeleton className="h-7 w-20 bg-[#efe7dc]" />
        </div>
      ))}
    </div>
  );
}

function CouponsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="relative min-h-72 overflow-hidden rounded-md border border-[#1c1a18]/10 bg-white p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-2.5 w-20 bg-[#efe7dc]" />
            <Skeleton className="h-5 w-16 bg-[#efe7dc]" />
          </div>
          <Skeleton className="mt-4 h-7 w-32 bg-[#efe7dc]" />

          <div className="my-8 border-t border-dashed border-[#1c1a18]/15" />

          <Skeleton className="h-9 w-24 bg-[#efe7dc]" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-4/5 bg-[#efe7dc]" />
            <Skeleton className="h-3 w-3/5 bg-[#efe7dc]" />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Skeleton className="h-2.5 w-24 bg-[#efe7dc]" />
            <Skeleton className="h-2.5 w-16 bg-[#efe7dc]" />
          </div>
          <Skeleton className="mt-2 h-1.5 w-full rounded-full bg-[#efe7dc]" />
        </article>
      ))}
    </div>
  );
}
