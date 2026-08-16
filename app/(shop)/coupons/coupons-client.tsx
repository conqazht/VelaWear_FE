"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CalendarClock, Check, Copy, History, PiggyBank, Ticket } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCouponsQuery } from "@/lib/queries/commerce";
import type { Coupon } from "@/lib/api/types";
import { money } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

const formatCouponValue = (coupon: Coupon, locale: Locale) =>
  coupon.type.includes("PERCENT") ? `${coupon.value}%` : money(Number(coupon.value || 0), locale);

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const totalSavings = usageHistory.reduce(
    (total, usage) => total + Number(usage.discountAmount || 0),
    0,
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
      <div className="bg-canvas text-ink flex min-h-[100dvh] items-center justify-center px-6 pt-[120px]">
        <p className="text-sm font-medium tracking-wider text-[#1c1a18]/60 uppercase">
          {t("coupons.signIn")}
        </p>
      </div>
    );
  }

  if (couponsQuery.isError && !couponsQuery.data) {
    return (
      <StorefrontApiStatus
        error={couponsQuery.error}
        onRetry={() => void couponsQuery.refetch()}
        resourceLabel={t("coupons.resource")}
        returnHref="/collection"
        variant="route"
      />
    );
  }

  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <section className="flex flex-col gap-6 text-left">
          <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
            <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
              {t("coupons.title")}
            </h2>
            <span className="text-xs text-[#55423d]/65">
              {t("coupons.availableCount", { count: coupons.length })}
            </span>
          </div>

          {couponsQuery.isLoading ? (
            <CouponStatsLoadingSkeleton />
          ) : (
            !couponsQuery.isError && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <CouponStat
                  label={t("coupons.stat.available")}
                  value={coupons.length.toString()}
                  icon={<Ticket className="size-4" />}
                />
                <CouponStat
                  label={t("coupons.stat.used")}
                  value={usageHistory.length.toString()}
                  icon={<History className="size-4" />}
                />
                <CouponStat
                  label={t("coupons.stat.saved")}
                  value={money(totalSavings, locale)}
                  icon={<PiggyBank className="size-4" />}
                />
                <CouponStat
                  label={t("coupons.stat.expiring")}
                  value={expiringSoon.toString()}
                  icon={<CalendarClock className="size-4" />}
                />
              </div>
            )
          )}

          {couponsQuery.isError ? (
            <StorefrontStaleWarning
              resourceLabel={t("coupons.resource")}
              onRetry={() => void couponsQuery.refetch()}
              error={couponsQuery.error}
            />
          ) : couponsQuery.isLoading ? (
            <CouponsLoadingSkeleton />
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-[#1c1a18]/5 bg-white py-24 text-center shadow-sm">
              <Ticket className="mb-6 h-12 w-12 text-[#1c1a18]/20" strokeWidth={1} />
              <h2 className="mb-3 font-serif text-2xl font-light text-[#1c1a18]">
                {t("coupons.emptyTitle")}
              </h2>
              <p className="mx-auto max-w-md text-sm text-[#1c1a18]/60">
                {t("coupons.emptyDescription")}
              </p>
              <Link
                href="/"
                className="mt-8 rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#b5573a]"
              >
                {t("coupons.explore")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => {
                const usagePercentage = getUsagePercentage(coupon);
                const isCopied = copiedCode === coupon.code;
                const isPercent = coupon.type.includes("PERCENT");

                return (
                  <div
                    key={coupon.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1c1a18]/10 bg-white shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Top Section: Benefit & Conditions */}
                    <div className="p-6 pb-5 md:p-7">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
                          {isPercent ? t("coupons.type.percentage") : t("coupons.type.fixed")}
                        </span>
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
                          <span className="block truncate font-mono text-sm font-bold tracking-wider text-[#1c1a18] select-all md:text-base">
                            {coupon.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(coupon.code)}
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
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[#55423d]/65">
                          <p>
                            {t("coupons.expires", {
                              date: coupon.endDate
                                ? formatDate(coupon.endDate, locale)
                                : t("coupons.noExpiry"),
                            })}
                          </p>
                          <p className="font-numeric tabular-nums">
                            {usagePercentage === null
                              ? t("coupons.unlimited")
                              : t("coupons.usedPercentage", { percentage: usagePercentage })}
                          </p>
                        </div>
                        {usagePercentage !== null && (
                          <div
                            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#1c1a18]/8"
                            role="progressbar"
                            aria-label={t("coupons.usageLabel", { code: coupon.code })}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={usagePercentage}
                          >
                            <div
                              className="h-full rounded-full bg-[#b5573a] transition-[width] duration-500"
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        )}
                      </div>
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
                <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
                  {t("coupons.recent")}
                </p>
                <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
                  {t("coupons.history")}
                </h2>
              </div>
              <span className="text-xs text-[#55423d]/65">
                {t("coupons.historyCount", { count: usageHistory.length })}
              </span>
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

function CouponsPageLoading() {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
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
          className="relative flex flex-col justify-between overflow-hidden rounded-md border border-[#1c1a18]/10 bg-white"
        >
          <div className="p-6 pb-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-20 bg-[#efe7dc]" />
              <Skeleton className="h-5 w-16 bg-[#efe7dc]" />
            </div>
            <Skeleton className="mt-4 h-9 w-28 bg-[#efe7dc]" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-4/5 bg-[#efe7dc]" />
              <Skeleton className="h-3 w-3/5 bg-[#efe7dc]" />
            </div>
          </div>

          <div className="relative flex items-center px-4">
            <div className="absolute -left-3 size-6 rounded-full border-r border-[#1c1a18]/10 bg-[#f7f4ef]" />
            <div className="w-full border-t border-dashed border-[#1c1a18]/15" />
            <div className="absolute -right-3 size-6 rounded-full border-l border-[#1c1a18]/10 bg-[#f7f4ef]" />
          </div>

          <div className="space-y-4 bg-[#fcfbfa]/80 p-6 pt-5 md:p-7">
            <Skeleton className="h-10 w-full rounded-sm bg-[#efe7dc]" />
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-24 bg-[#efe7dc]" />
              <Skeleton className="h-2.5 w-16 bg-[#efe7dc]" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full bg-[#efe7dc]" />
          </div>
        </article>
      ))}
    </div>
  );
}
