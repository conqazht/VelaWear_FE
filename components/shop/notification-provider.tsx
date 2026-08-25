"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, CheckCircle2, ArrowRight } from "lucide-react";
import { Product, money, getCategoryLabel } from "@/lib/vela-data";
import { useCart } from "./cart-provider";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";

type NotificationType = "bag" | "favorites";

interface NotificationState {
  type: NotificationType;
  product: Product;
  size: string;
  color: string;
}

interface NotificationContextValue {
  showAddedToBag: (product: Product, size: string, color: string) => void;
  showAddedToFavorites: (product: Product, size?: string) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { locale, t } = useI18n();
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const closeNotification = useCallback(() => {
    setIsVisible(false);
    // Delay setting state to null to allow fade-out transition
    setTimeout(() => {
      setNotification(null);
    }, 300);
  }, []);

  const triggerNotification = useCallback(
    (type: NotificationType, product: Product, size = "M", color = "Sand") => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setNotification({ type, product, size, color });
      setIsVisible(true);

      timerRef.current = setTimeout(() => {
        closeNotification();
      }, 5000);
    },
    [closeNotification],
  );

  const showAddedToBag = useCallback(
    (product: Product, size: string, color: string) => {
      triggerNotification("bag", product, size, color);
    },
    [triggerNotification],
  );

  const showAddedToFavorites = useCallback(
    (product: Product, size = "M") => {
      triggerNotification("favorites", product, size, product.color);
    },
    [triggerNotification],
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Close notification when path changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeNotification();
  }, [pathname, closeNotification]);

  return (
    <NotificationContext.Provider
      value={{ showAddedToBag, showAddedToFavorites, closeNotification }}
    >
      {children}

      {/* Floating Notification Panel */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`fixed top-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm transition-[transform,opacity] duration-300 ease-out sm:right-6 md:right-8 ${
            isVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
          }`}
          style={{ transitionProperty: "transform, opacity" }}
        >
          {notification.type === "bag" ? (
            /* ADDED TO BAG NOTIFICATION (Nike / Fashion Style) */
            <div className="relative ml-auto flex w-full max-w-[350px] flex-col rounded-2xl border border-[#1c1a18]/8 bg-white p-5 shadow-2xl shadow-black/10">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-5.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="size-3.5 stroke-[3px]" />
                  </div>
                  <h2 className="mt-0.5 font-sans text-base leading-none font-bold text-[#1c1a18]">
                    {t("notification.addedToBag")}
                  </h2>
                </div>
                <button
                  onClick={closeNotification}
                  aria-label={t("notification.close")}
                  className="flex size-7 items-center justify-center rounded-full text-[#1c1a18]/50 transition-colors hover:bg-[#1c1a18]/5 hover:text-[#1c1a18]"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex flex-col gap-4">
                {/* Main Product */}
                <div className="flex items-center gap-3.5">
                  <div className="relative h-[90px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border border-[#1c1a18]/8 bg-[#f7f4ef]">
                    <Image
                      src={notification.product.image}
                      alt={notification.product.name}
                      width={72}
                      height={90}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
                    <h3 className="truncate font-sans text-sm leading-tight font-semibold text-[#1c1a18]">
                      {notification.product.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#1c1a18]/60">
                      {getCategoryLabel(notification.product.category, locale)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#1c1a18]/60">
                      {notification.color ? `${notification.color} · ` : ""}
                      {t("common.size")} {notification.size}
                    </p>
                    <p className="font-numeric mt-1 font-sans text-sm font-bold text-[#1c1a18]">
                      {money(notification.product.price, locale)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    href="/cart"
                    onClick={closeNotification}
                    className="flex h-10.5 w-full items-center justify-center rounded-full border border-[#1c1a18]/20 bg-white px-4 text-xs font-bold tracking-wider text-[#1c1a18] uppercase transition-colors hover:border-[#1c1a18] hover:bg-[#1c1a18]/5"
                  >
                    {t("notification.viewBag", { count: itemCount })}
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeNotification}
                    className="flex h-10.5 w-full items-center justify-center rounded-full bg-[#b5573a] px-4 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[#8f4329]"
                  >
                    {t("notification.checkout")}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ADDED TO FAVORITES NOTIFICATION (Sharp Style) */
            <div className="ml-auto flex w-full max-w-[350px] flex-col overflow-hidden rounded-2xl border border-[#1c1a18]/8 bg-white shadow-2xl shadow-black/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1c1a18]/8 bg-white px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 flex-shrink-0 text-emerald-600" />
                  <h2 className="m-0 font-sans text-sm font-semibold text-[#1c1a18]">
                    {t("notification.addedToFavorites")}
                  </h2>
                </div>
                <button
                  onClick={closeNotification}
                  aria-label={t("notification.close")}
                  className="flex size-7 items-center justify-center rounded-full text-[#1c1a18]/50 transition-colors hover:bg-[#1c1a18]/5 hover:text-[#1c1a18]"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex items-center gap-4 p-5 text-left">
                {/* Product Image */}
                <div className="relative h-[90px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border border-[#1c1a18]/8 bg-[#f7f4ef]">
                  <Image
                    src={notification.product.image}
                    alt={notification.product.name}
                    width={72}
                    height={90}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Product Details */}
                <div className="flex min-w-0 flex-grow flex-col justify-center">
                  <p className="mb-1 text-[9px] font-semibold tracking-widest text-[#1c1a18]/60 uppercase">
                    {getCategoryLabel(notification.product.category, locale)}
                  </p>
                  <h3 className="mb-1 truncate font-sans text-sm leading-snug font-semibold text-[#1c1a18]">
                    {notification.product.name}
                  </h3>
                  <p className="mb-1.5 text-xs text-[#1c1a18]/60">
                    {notification.color ? `${notification.color} · ` : ""}
                    {t("common.size")}: {notification.size}
                  </p>
                  <p className="font-numeric font-sans text-sm font-bold text-[#1c1a18]">
                    {money(notification.product.price, locale)}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => {
                    closeNotification();
                    router.push("/favorites");
                  }}
                  className="flex h-10.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1c1a18] px-4 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[#b5573a]"
                >
                  <span>{t("notification.viewFavorites")}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return context;
}
