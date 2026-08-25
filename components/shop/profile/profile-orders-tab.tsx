import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const orders = ordersQuery.data?.result ?? [];

  const orderStats = orderStatusOrder.map((status) => ({
    status,
    ...orderStatusMeta[status],
    label: t(orderStatusLabelKeys[status]),
    count: orders.filter((order) => order.status === status).length,
  }));

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus !== "ALL" && order.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesCode = order.orderCode?.toLowerCase().includes(query);
        const matchesReceiver =
          order.receiverName?.toLowerCase().includes(query) ||
          order.receiverPhone?.toLowerCase().includes(query) ||
          order.receiverAddress?.toLowerCase().includes(query);
        const matchesItems = order.items?.some(
          (item) =>
            item.productName?.toLowerCase().includes(query) ||
            item.variantName?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query),
        );
        if (!matchesCode && !matchesReceiver && !matchesItems) {
          return false;
        }
      }
      return true;
    });
  }, [orders, searchQuery, selectedStatus]);

  const hasActiveFilter = selectedStatus !== "ALL" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

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
        <>
          {/* Interactive Status Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {orderStats.map((stat) => {
              const percentage = Math.round((stat.count / orders.length) * 100);
              const isSelected = selectedStatus === stat.status;
              return (
                <button
                  key={stat.status}
                  type="button"
                  onClick={() => setSelectedStatus(isSelected ? "ALL" : stat.status)}
                  className={`border-hairline/45 rounded-sm border p-4 text-left transition-all ${
                    isSelected
                      ? "ring-2 ring-[#b5573a] bg-white shadow-sm"
                      : "bg-white/65 hover:bg-white cursor-pointer"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`size-2 rounded-full ${stat.dot}`} aria-hidden="true" />
                    <span className="text-ink/50 text-[10px] font-semibold tracking-[0.12em] uppercase">
                      {stat.label}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-ink font-serif text-2xl">{stat.count}</span>
                    <span className="text-ink/40 pb-0.5 text-[10px] font-medium">
                      {percentage}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search bar & Filter Pills */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-[#1c1a18] text-white"
                    : "bg-[#1c1a18]/5 text-[#1c1a18]/70 hover:bg-[#1c1a18]/10"
                }`}
              >
                {t("account.orders.filterAll")}
              </button>
              {orderStatusOrder.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-sm px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#1c1a18] text-white"
                        : "bg-[#1c1a18]/5 text-[#1c1a18]/70 hover:bg-[#1c1a18]/10"
                    }`}
                  >
                    {t(orderStatusLabelKeys[status])}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#1c1a18]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("account.orders.searchPlaceholder")}
                className="w-full rounded-sm border border-[#1c1a18]/15 bg-white py-2 pr-8 pl-9 text-xs text-[#1c1a18] placeholder:text-[#1c1a18]/40 focus:border-[#1c1a18] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1c1a18]/40 hover:text-[#1c1a18] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </>
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
      ) : filteredOrders.length === 0 ? (
        <div className="bg-surface-card/10 border-hairline/20 rounded-sm border py-12 text-center select-none">
          <p className="mb-4 text-sm text-[#1c1a18]/60">{t("account.orders.noFilteredOrders")}</p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center rounded-sm border border-[#1c1a18]/20 bg-white px-5 py-2 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:border-[#1c1a18] hover:bg-[#efe7dc] cursor-pointer"
            >
              {t("account.orders.clearFilter")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => {
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
