"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "boneyard-js/react";
import { CalendarClock, History, PiggyBank, Ticket } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useMyCouponsQuery } from "@/lib/queries/commerce";
import type { Coupon } from "@/lib/api/types";
import { money } from "@/lib/vela-data";

const formatCouponValue = (coupon: Coupon) =>
  coupon.type.includes("PERCENT")
    ? `${coupon.value}%`
    : money(Number(coupon.value || 0));

const formatDisplayDate = (value?: string | null, locale = "vi-VN") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale);
};

const getUsagePercentage = (coupon: Coupon) => {
  if (!coupon.usageLimit || coupon.usageLimit <= 0) return null;
  return Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));
};

export function CouponsClient() {
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

  if (!isAuthenticated || !user) {
    return (
      <Skeleton name="coupons-page" loading={isAuthLoading} fallback={<CouponsLoadingFallback />} fixture={<CouponsLoadingFixture />}>
      <div className="bg-canvas text-ink min-h-[100dvh] pt-[120px] px-6 flex items-center justify-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[#1c1a18]/60">Vui lòng đăng nhập để xem mã giảm giá.</p>
      </div>
      </Skeleton>
    );
  }

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">
        <section className="flex flex-col gap-6 text-left">
          <div className="border-b border-[#1c1a18]/10 pb-4 flex justify-between items-end">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
              Mã giảm giá
            </h2>
            <span className="text-xs text-[#55423d]/65">
              Bạn đang có <span className="font-semibold text-[#1c1a18] font-numeric">{coupons.length}</span> mã khả dụng
            </span>
          </div>

          {!couponsQuery.isLoading && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <CouponStat label="Mã khả dụng" value={coupons.length.toString()} icon={<Ticket className="size-4" />} />
              <CouponStat label="Lượt đã dùng" value={usageHistory.length.toString()} icon={<History className="size-4" />} />
              <CouponStat label="Đã tiết kiệm" value={money(totalSavings)} icon={<PiggyBank className="size-4" />} />
              <CouponStat label="Sắp hết hạn" value={expiringSoon.toString()} icon={<CalendarClock className="size-4" />} />
            </div>
          )}

        {couponsQuery.isLoading ? (
          <Skeleton
            name="coupons-page"
            loading
            fallback={<CouponsLoadingFallback />}
            fixture={<CouponsLoadingFixture />}
          >
            <CouponsLoadingFixture />
          </Skeleton>
        ) : coupons.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1c1a18]/5 rounded-md shadow-sm">
            <Ticket className="w-12 h-12 text-[#1c1a18]/20 mb-6" strokeWidth={1} />
            <h2 className="font-serif text-2xl text-[#1c1a18] font-light mb-3">Không có mã giảm giá</h2>
            <p className="text-sm text-[#1c1a18]/60 max-w-md mx-auto">
              Hiện tại bạn chưa có mã giảm giá nào. Hãy thường xuyên kiểm tra hoặc mua sắm để nhận thêm ưu đãi.
            </p>
            <Link href="/" className="mt-8 px-8 py-3.5 bg-[#1c1a18] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#b85a3c] transition-colors">
              Khám phá sản phẩm
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
                      {coupon.type.replaceAll("_", " ")}
                    </p>
                    <span className="rounded-sm bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                      {coupon.status === "ACTIVE" ? "Khả dụng" : coupon.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18]">
                    {coupon.code}
                  </h3>
                </div>

                <div className="pt-8 flex flex-col gap-1 relative z-10">
                  <p className="text-3xl font-semibold text-[#1c1a18] font-numeric mb-2">
                    {formatCouponValue(coupon)}
                  </p>
                  <p className="text-xs text-[#1c1a18]/60">
                    Đơn tối thiểu {money(Number(coupon.minOrderAmount ?? 0))}
                  </p>
                  {coupon.maxDiscount && (
                    <p className="text-xs text-[#1c1a18]/60">
                      Giảm tối đa {money(Number(coupon.maxDiscount))}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3 text-[11px] text-[#1c1a18]/50 font-medium">
                    <p>HSD: {formatDisplayDate(coupon.endDate) || "Không thời hạn"}</p>
                    <p>
                      {usagePercentage === null
                        ? "Không giới hạn lượt dùng"
                        : `Đã sử dụng ${usagePercentage}%`}
                    </p>
                  </div>
                  {usagePercentage !== null && (
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1c1a18]/8"
                      role="progressbar"
                      aria-label={`Mức sử dụng mã ${coupon.code}`}
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

        {!couponsQuery.isLoading && (
          <section className="flex flex-col gap-6 text-left">
            <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b85a3c]">
                  Hoạt động gần đây
                </p>
                <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
                  Lịch sử sử dụng coupon
                </h2>
              </div>
              <span className="text-xs text-[#55423d]/65">{usageHistory.length} lượt sử dụng</span>
            </div>

            {usageHistory.length === 0 ? (
              <div className="rounded-md border border-[#1c1a18]/5 bg-white py-14 text-center">
                <History className="mx-auto mb-4 size-9 text-[#1c1a18]/20" strokeWidth={1.25} />
                <p className="text-sm text-[#1c1a18]/55">Bạn chưa sử dụng coupon cho đơn hàng nào.</p>
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
                          Đã dùng
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#1c1a18]/55">
                        Đơn {usage.orderCode} · {formatDisplayDate(usage.usedAt)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1c1a18]/45">Đã giảm</p>
                      <p className="mt-1 font-numeric text-base font-semibold text-emerald-700">
                        −{money(Number(usage.discountAmount || 0))}
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

function CouponsLoadingFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 rounded-md bg-white" />
      ))}
    </div>
  );
}

function CouponsLoadingFixture() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="min-h-72 rounded-md border border-[#1c1a18]/10 bg-white p-8">
          <p className="text-xs uppercase tracking-widest">Phần trăm</p>
          <h3 className="mt-4 font-serif text-2xl">VELA20</h3>
          <p className="mt-16 text-3xl font-semibold">20%</p>
          <p className="mt-3 text-xs">Đơn tối thiểu 500.000 ₫</p>
        </article>
      ))}
    </div>
  );
}
