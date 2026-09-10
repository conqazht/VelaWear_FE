"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Bell, CheckCheck, CreditCard, ExternalLink, Info, Sparkles, Truck } from "lucide-react";
import {
  useMyNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/hooks/use-notifications";
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
      return <Truck className="size-4 text-[#b5573a]" />;
    case "PROMOTION":
      return <Sparkles className="size-4 text-[#c47355]" />;
    case "PAYMENT":
      return <CreditCard className="size-4 text-[#2e7d32]" />;
    case "SYSTEM":
    default:
      return <Info className="size-4 text-[#8a857c]" />;
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

  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery();
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useMyNotificationsQuery(
    { size: 8, sort: "createdAt,desc" },
    isOpen, // Only fetch list when dropdown is open or about to open
  );

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  // Close on outside pointerdown
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [isOpen]);

  const notifications = notificationsData?.result ?? [];

  const defaultIconClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

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
            className="absolute top-0 right-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border border-[#f7f4ef] bg-[#b5573a] px-1 text-[9px] font-bold text-white shadow-xs"
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
            className="absolute top-11 right-0 z-50 w-80 overflow-hidden rounded-xl border border-[#1c1a18]/10 bg-white shadow-[0_12px_40px_rgba(28,26,24,0.12)] sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1c1a18]/10 bg-[#f7f4ef]/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
                  {t("notifications.title")}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#b5573a]/10 px-2 py-0.5 text-[10px] font-semibold text-[#b5573a]">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#b5573a] transition-colors hover:text-[#903e26] disabled:opacity-50"
                  title={t("notifications.markAllRead")}
                >
                  <CheckCheck className="size-3.5" />
                  <span>{t("notifications.markAllRead")}</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] divide-y divide-[#1c1a18]/5 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3">
                      <div className="size-10 shrink-0 rounded-full bg-[#1c1a18]/5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 rounded bg-[#1c1a18]/10" />
                        <div className="h-2.5 w-full rounded bg-[#1c1a18]/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="px-4 py-8 text-center text-xs text-[#8a857c]">
                  {t("notifications.error")}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#f7f4ef] text-[#8a857c]">
                    <Bell className="size-5 opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-[#1c1a18]">
                    {t("notifications.emptyTitle")}
                  </p>
                  <p className="mt-1 max-w-[220px] text-[11px] text-[#8a857c]">
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
                        ? "bg-white hover:bg-[#f7f4ef]/60"
                        : "bg-[#fdfaf7] hover:bg-[#f7f4ef]",
                    )}
                  >
                    {/* Thumbnail or Type Icon */}
                    <div className="relative mt-0.5 shrink-0">
                      {item.imageUrl ? (
                        <div className="size-10 overflow-hidden rounded-md border border-[#1c1a18]/10 bg-white">
                          <Image
                            src={resolveImageUrl(item.imageUrl)}
                            alt=""
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full border border-[#1c1a18]/5 bg-[#efe7dc]/80">
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
                              ? "font-medium text-[#1c1a18]/90"
                              : "font-bold text-[#1c1a18]",
                          )}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-[#b5573a]"
                            aria-label={t("notifications.unread")}
                          />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[#1c1a18]/70">
                        {item.content}
                      </p>

                      <p className="mt-1.5 text-[10px] text-[#8a857c]">
                        {formatRelativeTime(item.createdAt, locale)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#1c1a18]/10 bg-[#f7f4ef]/50 px-4 py-2.5 text-center">
              <Link
                href="/profile/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c1a18] transition-colors hover:text-[#b5573a]"
              >
                <span>{t("notifications.viewAll")}</span>
                <ExternalLink className="size-3 text-[#8a857c]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
