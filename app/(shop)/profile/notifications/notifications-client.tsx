"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
  Sparkles,
  Truck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useMyNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/i18n/format";
import { resolveImageUrl } from "@/lib/vela-data";
import type { NotificationItem, NotificationType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "ORDER_UPDATE":
      return <Truck className="size-5 text-[#b5573a]" />;
    case "PROMOTION":
      return <Sparkles className="size-5 text-[#c47355]" />;
    case "PAYMENT":
      return <CreditCard className="size-5 text-[#2e7d32]" />;
    case "SYSTEM":
    default:
      return <Info className="size-5 text-[#8a857c]" />;
  }
}

export function NotificationsClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery(isAuthenticated);

  const filterParams = {
    page: currentPage,
    size: pageSize,
    sort: "createdAt,desc",
    ...(activeTab === "unread" ? { isRead: false } : {}),
  };

  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useMyNotificationsQuery(filterParams, isAuthenticated);

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsData?.result ?? [];
  const meta = notificationsData?.meta;
  const totalPages = meta?.pages ?? 1;

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    if (item.linkUrl) {
      router.push(item.linkUrl);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] px-4 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-[#1c1a18]/10" />
          <div className="h-64 animate-pulse rounded-xl bg-white shadow-xs" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f7f4ef] px-4 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#efe7dc] text-[#b5573a]">
          <Bell className="size-6" />
        </div>
        <h1 className="text-lg font-bold text-[#1c1a18]">{t("notifications.title")}</h1>
        <p className="mt-1 text-sm text-[#8a857c]">{t("coupons.signIn")}</p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#1c1a18] px-6 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-[#b5573a]"
        >
          {t("storefront.nav.logIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#8a857c]">
              <Link href="/profile" className="transition-colors hover:text-[#b5573a]">
                {t("storefront.nav.profile")}
              </Link>
              <span>/</span>
              <span className="font-medium text-[#1c1a18]">{t("notifications.title")}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1c1a18] sm:text-3xl">
              {t("notifications.title")}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-[#b5573a]/30 bg-[#fdfaf7] px-4 py-2 text-xs font-semibold text-[#b5573a] shadow-xs transition-colors hover:bg-[#b5573a] hover:text-white disabled:opacity-50"
            >
              <CheckCheck className="size-4" />
              <span>{t("notifications.markAllRead")}</span>
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="mb-6 flex gap-2 border-b border-[#1c1a18]/10 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all",
              activeTab === "all"
                ? "bg-[#1c1a18] text-white shadow-xs"
                : "bg-white text-[#1c1a18]/70 hover:bg-[#efe7dc] hover:text-[#1c1a18]",
            )}
          >
            {t("notifications.all")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("unread");
              setCurrentPage(1);
            }}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all",
              activeTab === "unread"
                ? "bg-[#1c1a18] text-white shadow-xs"
                : "bg-white text-[#1c1a18]/70 hover:bg-[#efe7dc] hover:text-[#1c1a18]",
            )}
          >
            <span>{t("notifications.unread")}</span>
            {unreadCount > 0 && (
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[9px] font-bold",
                  activeTab === "unread"
                    ? "bg-[#b5573a] text-white"
                    : "bg-[#b5573a]/15 text-[#b5573a]",
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Cards */}
        <div className="overflow-hidden rounded-2xl border border-[#1c1a18]/10 bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-[#1c1a18]/5 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse gap-4 py-4">
                  <div className="size-12 shrink-0 rounded-full bg-[#1c1a18]/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-[#1c1a18]/10" />
                    <div className="h-3 w-3/4 rounded bg-[#1c1a18]/5" />
                    <div className="h-2.5 w-20 rounded bg-[#1c1a18]/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-[#8a857c]">
              {t("notifications.error")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-[#f7f4ef] text-[#8a857c]">
                <Bell className="size-7 opacity-60" />
              </div>
              <h2 className="text-base font-bold text-[#1c1a18]">
                {t("notifications.emptyTitle")}
              </h2>
              <p className="mt-1 max-w-sm text-xs text-[#8a857c]">
                {t("notifications.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1c1a18]/5">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-4 p-5 text-left transition-colors",
                    item.isRead
                      ? "bg-white hover:bg-[#f7f4ef]/50"
                      : "bg-[#fdfaf7] hover:bg-[#f7f4ef]",
                  )}
                >
                  {/* Thumbnail / Icon */}
                  <div className="mt-0.5 shrink-0">
                    {item.imageUrl ? (
                      <div className="size-12 overflow-hidden rounded-lg border border-[#1c1a18]/10 bg-white shadow-xs">
                        <Image
                          src={resolveImageUrl(item.imageUrl)}
                          alt=""
                          width={48}
                          height={48}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-full border border-[#1c1a18]/5 bg-[#efe7dc]/80">
                        {getNotificationIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Main Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={cn(
                          "text-sm",
                          item.isRead
                            ? "font-medium text-[#1c1a18]/90"
                            : "font-bold text-[#1c1a18]",
                        )}
                      >
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="size-2.5 shrink-0 rounded-full bg-[#b5573a]" />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-[#1c1a18]/70">{item.content}</p>

                    <p className="mt-2 text-[11px] text-[#8a857c]">
                      {formatRelativeTime(item.createdAt, locale)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#1c1a18]/10 bg-[#f7f4ef]/40 px-6 py-4 text-xs">
              <span className="text-[#8a857c]">
                {meta?.total} {t("notifications.title").toLowerCase()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-[#1c1a18]/10 bg-white text-[#1c1a18] transition-colors hover:bg-[#efe7dc] disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <span className="font-semibold text-[#1c1a18]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-[#1c1a18]/10 bg-white text-[#1c1a18] transition-colors hover:bg-[#efe7dc] disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
