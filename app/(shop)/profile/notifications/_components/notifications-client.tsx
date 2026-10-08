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
      return <Truck className="text-primary size-5" />;
    case "PROMOTION":
      return <Sparkles className="text-primary/85 size-5" />;
    case "PAYMENT":
      return <CreditCard className="size-5 text-emerald-600 dark:text-emerald-400" />;
    case "SYSTEM":
    default:
      return <Info className="text-muted-foreground size-5" />;
  }
}

export function NotificationsClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery(user?.id, isAuthenticated);

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
  } = useMyNotificationsQuery(user?.id, filterParams, isAuthenticated);

  const markAsReadMutation = useMarkNotificationAsReadMutation(user?.id);
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation(user?.id);

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
      <div className="bg-background min-h-screen px-4 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-foreground/10 h-8 w-48 animate-pulse rounded" />
          <div className="border-border bg-card h-64 animate-pulse rounded-xl border shadow-xs" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="bg-muted text-primary mb-4 flex size-14 items-center justify-center rounded-full">
          <Bell className="size-6" />
        </div>
        <h1 className="text-foreground text-lg font-bold">{t("notifications.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("coupons.signIn")}</p>
        <Link
          href="/sign-in"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-10 items-center justify-center rounded-full px-6 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          {t("storefront.nav.logIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-10 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
              <Link href="/profile" className="hover:text-primary transition-colors">
                {t("storefront.nav.profile")}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{t("notifications.title")}</span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {t("notifications.title")}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border px-4 py-2 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCheck className="size-4" />
              <span>{t("notifications.markAllRead")}</span>
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="border-border mb-6 flex gap-2 border-b pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all",
              activeTab === "all"
                ? "bg-foreground text-background shadow-xs"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
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
                ? "bg-foreground text-background shadow-xs"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span>{t("notifications.unread")}</span>
            {unreadCount > 0 && (
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[9px] font-bold",
                  activeTab === "unread"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/15 text-primary",
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Cards */}
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
          {isLoading ? (
            <div className="divide-border/60 divide-y p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse gap-4 py-4">
                  <div className="bg-muted size-12 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted-foreground/20 h-3.5 w-1/3 rounded" />
                    <div className="bg-muted h-3 w-3/4 rounded" />
                    <div className="bg-muted h-2.5 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-muted-foreground py-16 text-center text-sm">
              {t("notifications.error")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="bg-muted text-muted-foreground mb-3 flex size-16 items-center justify-center rounded-full">
                <Bell className="size-7 opacity-60" />
              </div>
              <h2 className="text-foreground text-base font-bold">
                {t("notifications.emptyTitle")}
              </h2>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                {t("notifications.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="divide-border/60 divide-y">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-4 p-5 text-left transition-colors",
                    item.isRead ? "bg-card hover:bg-muted/40" : "bg-muted/20 hover:bg-muted/50",
                  )}
                >
                  {/* Thumbnail / Icon */}
                  <div className="mt-0.5 shrink-0">
                    {item.imageUrl ? (
                      <div className="border-border bg-card size-12 overflow-hidden rounded-lg border shadow-xs">
                        <Image
                          src={resolveImageUrl(item.imageUrl)}
                          alt=""
                          width={48}
                          height={48}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border-border/60 bg-muted flex size-11 items-center justify-center rounded-full border">
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
                            ? "text-foreground/85 font-medium"
                            : "text-foreground font-bold",
                        )}
                      >
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="bg-primary size-2.5 shrink-0 rounded-full" />
                      )}
                    </div>

                    <p className="text-foreground/75 mt-1 text-xs leading-relaxed">
                      {item.content}
                    </p>

                    <p className="text-muted-foreground mt-2 text-[11px]">
                      {formatRelativeTime(item.createdAt, locale)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-border bg-muted/30 flex items-center justify-between border-t px-6 py-4 text-xs">
              <span className="text-muted-foreground">
                {meta?.total} {t("notifications.title").toLowerCase()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="border-border bg-card text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <span className="text-foreground font-semibold">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="border-border bg-card text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
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
