"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Bell, CheckCheck, CreditCard, Info, Sparkles, Truck } from "lucide-react";
import {
  useMyNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/hooks/use-notifications";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatRelativeTime } from "@/lib/i18n/format";
import { EASE_VELA } from "@/lib/motion-tokens";
import { resolveImageUrl } from "@/lib/vela-data";
import type { NotificationItem, NotificationType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  shouldBeTransparent?: boolean;
  iconClass?: string;
  className?: string;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "ORDER_UPDATE":
      return <Truck className="text-primary size-4" />;
    case "PROMOTION":
      return <Sparkles className="text-primary/85 size-4" />;
    case "PAYMENT":
      return <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />;
    case "SYSTEM":
    default:
      return <Info className="text-muted-foreground size-4" />;
  }
}

export function NotificationBell({
  shouldBeTransparent = false,
  iconClass,
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { locale, t } = useI18n();
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery(user?.id, Boolean(user?.id));
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useMyNotificationsQuery(
    user?.id,
    { size: 8, sort: "createdAt,desc" },
    isOpen && Boolean(user?.id),
  );

  const markAsReadMutation = useMarkNotificationAsReadMutation(user?.id);
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation(user?.id);

  // Close on outside pointerdown or Escape key
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const notifications = notificationsData?.result ?? [];

  const defaultIconClass = shouldBeTransparent
    ? "text-primary-foreground/90 hover:text-primary-foreground"
    : "text-foreground hover:text-primary";

  const effectiveIconClass = iconClass || defaultIconClass;

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    setIsOpen(false);
    if (item.linkUrl) {
      router.push(item.linkUrl);
    } else {
      router.push("/profile/notifications");
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-flex", className)}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          effectiveIconClass,
          "relative cursor-pointer rounded-full p-2 transition-colors",
        )}
        whileHover={{
          scale: 1.04,
          backgroundColor: shouldBeTransparent ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={t("notifications.title")}
        aria-expanded={isOpen}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="border-background bg-primary text-primary-foreground absolute top-0 right-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border px-1 text-[9px] font-bold shadow-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_VELA }}
            className="border-border bg-popover text-popover-foreground absolute top-11 right-0 z-50 w-80 overflow-hidden rounded-2xl border shadow-xl sm:w-96"
          >
            {/* Header */}
            <div className="border-border bg-muted/60 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-sans text-xs font-bold tracking-wider uppercase">
                  {t("notifications.title")}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-primary hover:text-primary/80 inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-colors disabled:opacity-50"
                  title={t("notifications.markAllRead")}
                >
                  <CheckCheck className="size-3.5" />
                  <span>{t("notifications.markAllRead")}</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="divide-border/60 max-h-[380px] divide-y overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3">
                      <div className="bg-muted size-10 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <div className="bg-muted-foreground/20 h-3 w-3/4 rounded" />
                        <div className="bg-muted h-2.5 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-xs">
                  {t("notifications.error")}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="bg-muted text-muted-foreground mb-2 flex size-12 items-center justify-center rounded-full">
                    <Bell className="size-5 opacity-60" />
                  </div>
                  <p className="text-foreground text-xs font-semibold">
                    {t("notifications.emptyTitle")}
                  </p>
                  <p className="text-muted-foreground mt-1 max-w-[220px] text-[11px]">
                    {t("notifications.emptyDescription")}
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      "group flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors",
                      item.isRead
                        ? "bg-popover hover:bg-muted/40"
                        : "bg-muted/20 hover:bg-muted/50",
                    )}
                  >
                    {/* Thumbnail or Type Icon */}
                    <div className="relative mt-0.5 shrink-0">
                      {item.imageUrl ? (
                        <div className="border-border bg-card size-10 overflow-hidden rounded-md border">
                          <Image
                            src={resolveImageUrl(item.imageUrl)}
                            alt=""
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="border-border/60 bg-muted flex size-9 items-center justify-center rounded-full border">
                          {getNotificationIcon(item.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "truncate text-xs",
                            item.isRead
                              ? "text-popover-foreground/85 font-medium"
                              : "text-popover-foreground font-bold",
                          )}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span
                            className="bg-primary size-2 shrink-0 rounded-full"
                            aria-label={t("notifications.unread")}
                          />
                        )}
                      </div>

                      <p className="text-popover-foreground/75 mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                        {item.content}
                      </p>

                      <p className="text-muted-foreground mt-1.5 text-[10px]">
                        {formatRelativeTime(item.createdAt, locale)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-border bg-muted/40 border-t px-4 py-2.5 text-center">
              <Link
                href="/profile/notifications"
                onClick={() => setIsOpen(false)}
                className="group/all text-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <span>{t("notifications.viewAll")}</span>
                <ArrowRight className="text-muted-foreground size-3 transition-transform group-hover/all:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
