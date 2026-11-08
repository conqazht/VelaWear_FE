"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gift, Sparkles, Check, PenTool } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { useGiftOptions, type GiftOptions, GIFT_STORAGE_KEY } from "@/hooks/use-gift-options";

export type { GiftOptions };
export { GIFT_STORAGE_KEY };

export function GiftCustomizer({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const { options, updateOptions, isLoaded } = useGiftOptions();

  if (!isLoaded) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#efe7dc] bg-white p-5 shadow-2xs transition-all",
        options.enabled && "border-[#d4af37]/60 shadow-sm",
        className,
      )}
    >
      {/* Main Toggle Header */}
      <label className="flex cursor-pointer items-start gap-3.5 select-none">
        <input
          type="checkbox"
          checked={options.enabled}
          onChange={(e) => updateOptions({ enabled: e.target.checked })}
          className="mt-1 size-4.5 rounded-sm border-[#1c1a18]/30 text-[#b5573a] accent-[#b5573a] focus:ring-[#b5573a]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-[#b5573a]" />
            <span className="font-serif text-sm font-semibold text-[#1c1a18]">
              {t("giftCustomizer.title")}
            </span>
            <span className="rounded-full bg-[#d4af37]/15 px-2 py-0.5 text-[10px] font-bold text-[#b5573a]">
              LUXE
            </span>
          </div>
          <p className="mt-1 text-xs text-[#1c1a18]/60">{t("giftCustomizer.checkbox")}</p>
        </div>
      </label>

      {/* Expanded Gift Customization Drawer */}
      <AnimatePresence>
        {options.enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-5 border-t border-[#efe7dc] pt-5">
              {/* Box Selection */}
              <div>
                <span className="text-xs font-semibold tracking-wider text-[#1c1a18] uppercase">
                  {t("giftCustomizer.boxSection")}
                </span>
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Signature Noir */}
                  <button
                    type="button"
                    onClick={() => updateOptions({ boxType: "signature" })}
                    className={cn(
                      "flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                      options.boxType === "signature"
                        ? "border-[#d4af37] bg-[#1c1a18] text-white shadow-sm"
                        : "border-[#efe7dc] bg-[#fbf9f5] text-[#1c1a18] hover:border-[#1c1a18]/30",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-serif text-xs font-bold">
                        {t("giftCustomizer.signatureBox")}
                      </span>
                      {options.boxType === "signature" && (
                        <Check className="size-4 text-[#d4af37]" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 text-[11px] leading-relaxed",
                        options.boxType === "signature" ? "text-stone-300" : "text-[#1c1a18]/60",
                      )}
                    >
                      {t("giftCustomizer.signatureBoxDesc")}
                    </p>
                  </button>

                  {/* Eco Botanical */}
                  <button
                    type="button"
                    onClick={() => updateOptions({ boxType: "eco" })}
                    className={cn(
                      "flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                      options.boxType === "eco"
                        ? "border-[#b5573a] bg-[#1c1a18] text-white shadow-sm"
                        : "border-[#efe7dc] bg-[#fbf9f5] text-[#1c1a18] hover:border-[#1c1a18]/30",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-serif text-xs font-bold">
                        {t("giftCustomizer.ecoBox")}
                      </span>
                      {options.boxType === "eco" && <Check className="size-4 text-[#d4af37]" />}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 text-[11px] leading-relaxed",
                        options.boxType === "eco" ? "text-stone-300" : "text-[#1c1a18]/60",
                      )}
                    >
                      {t("giftCustomizer.ecoBoxDesc")}
                    </p>
                  </button>
                </div>
              </div>

              {/* Handwritten Card Section */}
              <div className="space-y-3 pt-2">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#1c1a18]">
                  <input
                    type="checkbox"
                    checked={options.includeCard}
                    onChange={(e) => updateOptions({ includeCard: e.target.checked })}
                    className="size-4 rounded-sm border-[#1c1a18]/30 text-[#b5573a] accent-[#b5573a]"
                  />
                  <div className="flex items-center gap-1.5">
                    <PenTool className="size-3.5 text-[#b5573a]" />
                    <span>{t("giftCustomizer.cardCheckbox")}</span>
                  </div>
                </label>

                {options.includeCard && (
                  <div className="space-y-3 pl-6">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="gift-card-to"
                          className="block text-[11px] font-medium text-[#1c1a18]/70"
                        >
                          {t("giftCustomizer.cardTo")}
                        </label>
                        <input
                          id="gift-card-to"
                          type="text"
                          value={options.cardTo}
                          onChange={(e) => updateOptions({ cardTo: e.target.value })}
                          placeholder={t("giftCustomizer.cardToPlaceholder")}
                          className="mt-1 w-full rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
                          maxLength={40}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="gift-card-from"
                          className="block text-[11px] font-medium text-[#1c1a18]/70"
                        >
                          {t("giftCustomizer.cardFrom")}
                        </label>
                        <input
                          id="gift-card-from"
                          type="text"
                          value={options.cardFrom}
                          onChange={(e) => updateOptions({ cardFrom: e.target.value })}
                          placeholder={t("giftCustomizer.cardFromPlaceholder")}
                          className="mt-1 w-full rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
                          maxLength={40}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="gift-card-message"
                          className="block text-[11px] font-medium text-[#1c1a18]/70"
                        >
                          {t("giftCustomizer.cardMessage")}
                        </label>
                        <span className="text-[10px] text-[#1c1a18]/40">
                          {options.cardMessage.length}/150
                        </span>
                      </div>
                      <textarea
                        id="gift-card-message"
                        rows={2}
                        value={options.cardMessage}
                        onChange={(e) => updateOptions({ cardMessage: e.target.value })}
                        placeholder={t("giftCustomizer.cardMessagePlaceholder")}
                        maxLength={150}
                        className="mt-1 w-full resize-none rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Live Card Preview */}
                    {(options.cardTo || options.cardMessage || options.cardFrom) && (
                      <div className="mt-3 rounded-xl border border-[#d4af37]/40 bg-[#f7f4ef] p-4 text-center shadow-xs">
                        <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
                          <Sparkles className="size-3" />
                          <span>{t("giftCustomizer.previewBadge")}</span>
                        </div>
                        <div className="mt-2 font-serif text-xs font-semibold text-[#1c1a18]">
                          {options.cardTo ? `To: ${options.cardTo}` : "To: Dear Friend"}
                        </div>
                        <p className="mt-1.5 font-serif text-xs leading-relaxed text-[#1c1a18]/80 italic">
                          &ldquo;
                          {options.cardMessage || "Wishing you warmth, joy and timeless elegance."}
                          &rdquo;
                        </p>
                        <div className="mt-2 text-[11px] font-medium text-[#1c1a18]/60">
                          {options.cardFrom
                            ? `With Love, ${options.cardFrom}`
                            : "VELA WEAR ATELIER"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
