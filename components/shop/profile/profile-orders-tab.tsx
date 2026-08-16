import Link from "next/link";
import React from "react";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { money } from "@/lib/vela-data";
import type { Order } from "@/lib/api/types";
import {
  formatDisplayDate,
  orderStatusMeta,
  orderStatusLabelKeys,
} from "./profile-formatters";
import { ProfileOrdersLoading } from "./profile-loading";

const orderStatusOrder = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

interface ProfileOrdersTabProps {
  ordersQuery: {
    data?: { result: Order[] };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
}

export function ProfileOrdersTab({ ordersQuery }: ProfileOrdersTabProps) {
  const { locale, t } = useI18n();
  const orders = ordersQuery.data?.result ?? [];

  const orderStats = orderStatusOrder.map((status) => ({
    status,
    ...orderStatusMeta[status],
    label: t(orderStatusLabelKeys[status]),
    count: orders.filter((order) => order.status === status).length,
  }));

  return (
    <section className="flex flex-col gap-6 text-left">
      <div className="border-b border-hairline pb-4 flex justify-between items-end">
        <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
          {t("account.orders.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">
          {t(orders.length === 1 ? "account.orders.count.one" : "account.orders.count.many", { count: orders.length })}
        </span>
      </div>

      {ordersQuery.isError ? (
        <StorefrontStaleWarning
          onRetry={() => void ordersQuery.refetch()}
          resourceLabel={t("account.orders.resource")}
        />
      ) : null}

      {!ordersQuery.isLoading && orders.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {orderStats.map((stat) => {
            const percentage = Math.round((stat.count / orders.length) * 100);
            return (
              <div
                key={stat.status}
                className="rounded-sm border border-hairline/45 bg-white/65 p-4"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stat.dot}`} aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-serif text-2xl text-ink">{stat.count}</span>
                  <span className="pb-0.5 text-[10px] font-medium text-ink/40">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ordersQuery.isLoading ? (
        <ProfileOrdersLoading />
      ) : orders.length === 0 ? (
        <div className="py-12 text-center select-none bg-surface-card/10 border border-hairline/20 rounded-sm">
          <p className="text-sm text-[#1c1a18]/50 mb-6">{t("account.orders.empty")}</p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#b5573a] transition-colors"
          >
            {t("account.orders.shopNow")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => {
            const statusMeta = orderStatusMeta[order.status] ?? {
              badge: "bg-slate-100 text-slate-800",
              dot: "bg-slate-500",
            };
            const statusKey = orderStatusLabelKeys[order.status as keyof typeof orderStatusLabelKeys];
            const statusLabel = statusKey ? t(statusKey) : order.status;

            return (
              <Link
                key={order.id}
                href={`/profile/orders/${order.orderCode}`}
                className="border border-hairline/60 rounded-sm bg-surface-card/30 p-6 flex flex-col md:flex-row gap-6 justify-between hover:bg-surface-card/65 transition-colors cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-card overflow-hidden rounded-sm flex-shrink-0 border border-hairline/25 relative flex items-center justify-center">
                    <span className="font-serif text-xl font-light text-ink/40">V</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-sans text-sm font-semibold text-ink">{t("account.orders.order", { code: order.orderCode })}</h3>
                    <p className="text-xs text-[#55423d]/75 mt-0.5">
                      {t("account.orders.receiver", {
                        name: order.receiverName ?? t("account.order.notAvailable"),
                        phone: order.receiverPhone ?? t("account.order.notAvailable"),
                      })}
                    </p>
                    <p className="text-xs text-[#55423d]/75">
                      {t("account.orders.address", { address: order.receiverAddress ?? t("account.order.notAvailable") })}
                    </p>
                    <p className="text-xs text-[#55423d]/50 mt-1">
                      {t("account.orders.placedOn", { date: formatDisplayDate(order.createdAt, locale) })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-hairline/40">
                  <div className="text-sm font-bold text-ink">{money(Number(order.finalAmount ?? order.subtotal ?? 0), locale)}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusMeta.badge}`}>
                    {statusLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
