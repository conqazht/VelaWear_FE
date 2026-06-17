"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Check, CheckCircle2, ArrowRight } from "lucide-react";
import { Product, money, categoryLabels } from "@/lib/vela-data";
import { useCart } from "./cart-provider";
import { usePathname, useRouter } from "next/navigation";

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

  const triggerNotification = useCallback((type: NotificationType, product: Product, size = "M", color = "Sand") => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotification({ type, product, size, color });
    setIsVisible(true);

    timerRef.current = setTimeout(() => {
      closeNotification();
    }, 5000);
  }, [closeNotification]);

  const showAddedToBag = useCallback((product: Product, size: string, color: string) => {
    triggerNotification("bag", product, size, color);
  }, [triggerNotification]);

  const showAddedToFavorites = useCallback((product: Product, size = "M") => {
    triggerNotification("favorites", product, size, product.color);
  }, [triggerNotification]);

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
    <NotificationContext.Provider value={{ showAddedToBag, showAddedToFavorites, closeNotification }}>
      {children}

      {/* Floating Notification Panel */}
      {notification && (
        <div
          className={`fixed right-4 md:right-16 z-50 transition-all duration-300 ease-out max-w-sm md:max-w-md w-[calc(100vw-2rem)] ${
            isVisible
              ? "top-24 translate-y-0 opacity-100"
              : "top-20 -translate-y-4 opacity-0 pointer-events-none"
          }`}
          style={{ transitionProperty: "transform, opacity, top" }}
        >
          {notification.type === "bag" ? (
            /* ADDED TO BAG NOTIFICATION (Nike Style) */
            <div className="bg-canvas w-full max-w-[360px] shadow-2xl border border-hairline relative flex flex-col p-6 rounded-sm ml-auto text-ink">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="size-3.5 stroke-[3px]" />
                  </div>
                  <h2 className="font-sans text-lg font-bold text-ink leading-none mt-0.5">
                    Added to Bag
                  </h2>
                </div>
                <button
                  onClick={closeNotification}
                  aria-label="Close notification"
                  className="size-8 flex items-center justify-center text-ink/60 transition-colors hover:text-primary rounded-full hover:bg-surface-card"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex flex-col gap-6">
                {/* Main Product */}
                <div className="flex gap-4">
                  <div className="w-[88px] h-[88px] flex-shrink-0 bg-surface-card rounded-sm overflow-hidden border border-hairline/30">
                    <img
                      src={notification.product.image}
                      alt={notification.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <h3 className="font-sans text-sm font-semibold text-ink leading-tight">
                      {notification.product.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant/75 mt-1">
                      {categoryLabels[notification.product.category] ?? notification.product.category}
                    </p>
                    <p className="text-xs text-on-surface-variant/75 mt-0.5">
                      Size {notification.size}
                    </p>
                    <p className="font-sans text-sm font-bold text-ink mt-1.5">
                      {money(notification.product.price)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/cart"
                    onClick={closeNotification}
                    className="w-full bg-canvas text-ink text-center font-semibold text-xs tracking-wider uppercase py-3.5 px-6 border border-ink hover:bg-surface-card transition-colors duration-200 rounded-sm"
                  >
                    VIEW BAG ({itemCount})
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeNotification}
                    className="w-full bg-primary-container text-on-primary text-center font-semibold text-xs tracking-wider uppercase py-3.5 px-6 hover:bg-[#964025] transition-colors duration-200 rounded-sm"
                  >
                    CHECKOUT
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ADDED TO FAVORITES NOTIFICATION (Sharp Style) */
            <div className="w-full max-w-[400px] bg-canvas border border-hairline shadow-[0_20px_40px_-15px_rgba(28,26,24,0.15)] flex flex-col rounded-sm ml-auto overflow-hidden text-ink">
              {/* Header */}
              <div className="flex items-center justify-between px-6 border-b border-hairline bg-surface py-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600 size-5 flex-shrink-0" />
                  <h2 className="font-sans text-base font-semibold text-ink m-0 mt-0.5">
                    Added to Favorites
                  </h2>
                </div>
                <button
                  onClick={closeNotification}
                  aria-label="Close notification"
                  className="text-on-surface-variant/70 hover:text-ink transition-colors p-1 rounded-sm hover:bg-surface-card/50"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex gap-6 text-left">
                {/* Product Image */}
                <div className="w-[100px] h-[133px] flex-shrink-0 bg-surface-card border border-hairline/30 rounded-sm overflow-hidden">
                  <img
                    src={notification.product.image}
                    alt={notification.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Product Details */}
                <div className="flex flex-col justify-center flex-grow">
                  <p className="text-[9px] font-semibold text-on-surface-variant/80 uppercase tracking-widest mb-1.5">
                    {categoryLabels[notification.product.category] ?? notification.product.category}
                  </p>
                  <h3 className="font-sans text-sm font-semibold text-ink leading-snug mb-1">
                    {notification.product.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant/75 mb-2.5">
                    Size: {notification.size}
                  </p>
                  <p className="font-sans text-sm font-bold text-ink mt-auto">
                    {money(notification.product.price)}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    closeNotification();
                    router.push("/profile?tab=favourites");
                  }}
                  className="w-full text-on-dark font-semibold text-xs tracking-wider uppercase py-4 hover:bg-surface-dark/95 transition-colors border-none cursor-pointer flex items-center justify-center gap-2 bg-primary-container rounded-sm"
                >
                  VIEW FAVOURITES
                  <ArrowRight className="size-4" />
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
