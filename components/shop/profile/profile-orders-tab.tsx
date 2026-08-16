import Link from "next/link";
import React from "react";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { money } from "@/lib/vela-data";
import type { Order } from "@/lib/api/types";
import { formatDisplayDate, orderStatusMeta, orderStatusLabelKeys } from "./profile-formatters";
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
      <div className="border-hairline flex items-end justify-between border-b pb-4">
        <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
          {t("account.orders.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">
          {t(orders.length === 1 ? "account.orders.count.one" : "account.orders.count.many", {
            count: orders.length,
          })}
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
                className="border-hairline/45 rounded-sm border bg-white/65 p-4"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stat.dot}`} aria-hidden="true" />
                  <span className="text-ink/50 text-[10px] font-semibold tracking-[0.12em] uppercase">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-ink font-serif text-2xl">{stat.count}</span>
                  <span className="text-ink/40 pb-0.5 text-[10px] font-medium">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ordersQuery.isLoading ? (
        <ProfileOrdersLoading />
      ) : orders.length === 0 ? (
        <div className="bg-surface-card/10 border-hairline/20 rounded-sm border py-12 text-center select-none">
          <p className="mb-6 text-sm text-[#1c1a18]/50">{t("account.orders.empty")}</p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#b5573a]"
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
            const statusKey =
              orderStatusLabelKeys[order.status as keyof typeof orderStatusLabelKeys];
            const statusLabel = statusKey ? t(statusKey) : order.status;

            return (
              <Link
                key={order.id}
                href={`/profile/orders/${order.orderCode}`}
                className="border-hairline/60 bg-surface-card/30 hover:bg-surface-card/65 flex cursor-pointer flex-col justify-between gap-6 rounded-sm border p-6 transition-colors md:flex-row"
              >
                <div className="flex gap-4">
                  <div className="bg-surface-card border-hairline/25 relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border">
                    <span className="text-ink/40 font-serif text-xl font-light">V</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-ink font-sans text-sm font-semibold">
                      {t("account.orders.order", { code: order.orderCode })}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#55423d]/75">
                      {t("account.orders.receiver", {
                        name: order.receiverName ?? t("account.order.notAvailable"),
                        phone: order.receiverPhone ?? t("account.order.notAvailable"),
                      })}
                    </p>
                    <p className="text-xs text-[#55423d]/75">
                      {t("account.orders.address", {
                        address: order.receiverAddress ?? t("account.order.notAvailable"),
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[#55423d]/50">
                      {t("account.orders.placedOn", {
                        date: formatDisplayDate(order.createdAt, locale),
                      })}
                    </p>
                  </div>
                </div>
                <div className="border-hairline/40 flex flex-row justify-between gap-2 border-t pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
                  <div className="text-ink text-sm font-bold">
                    {money(Number(order.finalAmount ?? order.subtotal ?? 0), locale)}
                  </div>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${statusMeta.badge}`}
                  >
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
