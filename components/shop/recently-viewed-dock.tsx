"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clock3, X, Trash2, ArrowUpRight } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useI18n } from "@/components/providers/i18n-provider";
import { money } from "@/lib/vela-data";

export function RecentlyViewedDock() {
  const { locale, t } = useI18n();
  const { items, isLoaded, removeProduct, clearAll } = useRecentlyViewed();
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Don't render until client loaded, or if empty and closed
  if (!isLoaded || items.length === 0) return null;

  return (
    <div className="fixed right-5 bottom-6 z-40">
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: 0, y: 10 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 rounded-full border border-white/15 bg-[#1c1a18]/90 px-4 py-2.5 text-xs font-semibold tracking-wider text-[#f7f4ef] uppercase shadow-xl backdrop-blur-md transition-colors hover:bg-[#b5573a]"
            aria-label={t("recentlyViewed.dockLabel")}
          >
            <Clock3 className="size-4 text-[#d4af37]" />
            <span>{t("recentlyViewed.dockLabel")}</span>
            <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              {items.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Floating Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 20,
              scale: shouldReduceMotion ? 1 : 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 20,
              scale: shouldReduceMotion ? 1 : 0.96,
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-[90vw] max-w-[360px] overflow-hidden rounded-2xl border border-[#efe7dc] bg-white/95 shadow-2xl backdrop-blur-xl sm:max-w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#efe7dc] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-[#b5573a]" />
                <span className="font-serif text-sm font-medium tracking-wide text-[#1c1a18]">
                  {t("recentlyViewed.title")} ({items.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#1c1a18]/50 transition-colors hover:text-[#b5573a]"
                  title={t("recentlyViewed.clear")}
                >
                  <Trash2 className="size-3.5" />
                  <span>{t("recentlyViewed.clear")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex size-7 items-center justify-center rounded-full text-[#1c1a18]/60 transition-colors hover:bg-[#efe7dc] hover:text-[#1c1a18]"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="max-h-[360px] space-y-2.5 overflow-y-auto p-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-3 rounded-xl border border-transparent bg-[#fbf9f5] p-2 transition-all hover:border-[#efe7dc] hover:bg-white hover:shadow-xs"
                >
                  <Link
                    href={`/products/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="relative aspect-square size-16 shrink-0 overflow-hidden rounded-lg bg-[#efe7dc]"
                  >
                    <FashionImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block truncate font-serif text-xs font-medium text-[#1c1a18] transition-colors hover:text-[#b5573a]"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-numeric text-xs font-semibold text-[#1c1a18]">
                        {money(item.price, locale)}
                      </span>
                      {item.originalPrice ? (
                        <span className="font-numeric text-[10px] text-[#1c1a18]/40 line-through">
                          {money(item.originalPrice, locale)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex size-7 items-center justify-center rounded-full text-[#1c1a18]/50 transition-colors hover:bg-[#1c1a18] hover:text-white"
                      title={t("recentlyViewed.view")}
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.id)}
                      className="flex size-7 items-center justify-center rounded-full text-[#1c1a18]/30 transition-colors hover:text-[#b5573a]"
                      aria-label="Remove"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
