"use client";

import { useState } from "react";
import { Gift, Sparkles, Check, PenTool, Sparkle } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { useGiftOptions, type GiftOptions, GIFT_STORAGE_KEY } from "@/hooks/use-gift-options";

export type { GiftOptions };
export { GIFT_STORAGE_KEY };

interface SubcomponentProps {
  options: GiftOptions;
  updateOptions: (newOptions: Partial<GiftOptions>) => void;
}

function GiftBoxSelector({ options, updateOptions }: SubcomponentProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-[#1c1a18] uppercase">
          {t("giftCustomizer.boxSection")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Signature Noir Velvet Box */}
        <button
          type="button"
          onClick={() => updateOptions({ boxType: "signature" })}
          className={cn(
            "group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98]",
            options.boxType === "signature"
              ? "border-[#d4af37] bg-[#161514] text-white shadow-md ring-1 ring-[#d4af37]/50"
              : "border-[#e7ded1] bg-[#fbf9f5] text-[#1c1a18] hover:border-[#1c1a18]/30 hover:bg-white",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-sm font-semibold tracking-wide">
                {t("giftCustomizer.signatureBox")}
              </span>
              {options.boxType === "signature" ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#161514] shadow-xs">
                  <Check className="size-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="size-5 shrink-0 rounded-full border border-stone-300 transition-colors group-hover:border-stone-400" />
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-[11px] leading-relaxed",
                options.boxType === "signature" ? "text-stone-300" : "text-[#1c1a18]/65",
              )}
            >
              {t("giftCustomizer.signatureBoxDesc")}
            </p>
          </div>
        </button>

        {/* Botanical Eco-Craft Box */}
        <button
          type="button"
          onClick={() => updateOptions({ boxType: "eco" })}
          className={cn(
            "group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98]",
            options.boxType === "eco"
              ? "border-[#4a7c59] bg-[#14231b] text-white shadow-md ring-1 ring-[#4a7c59]/50"
              : "border-[#e7ded1] bg-[#fbf9f5] text-[#1c1a18] hover:border-[#1c1a18]/30 hover:bg-white",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-sm font-semibold tracking-wide">
                {t("giftCustomizer.ecoBox")}
              </span>
              {options.boxType === "eco" ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#86efac] text-[#14231b] shadow-xs">
                  <Check className="size-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="size-5 shrink-0 rounded-full border border-stone-300 transition-colors group-hover:border-stone-400" />
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-[11px] leading-relaxed",
                options.boxType === "eco" ? "text-stone-300" : "text-[#1c1a18]/65",
              )}
            >
              {t("giftCustomizer.ecoBoxDesc")}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function GiftCardPreview({ options }: { options: GiftOptions }) {
  const { t, locale } = useI18n();

  const recipient = options.cardTo.trim() || (locale === "vi" ? "Người thương" : "Dearest Friend");
  const sender = options.cardFrom.trim() || (locale === "vi" ? "VELA ATELIER" : "VELA ATELIER");
  const message =
    options.cardMessage.trim() ||
    (locale === "vi"
      ? "Chúc bạn luôn tìm thấy sự tự tin, nét tinh tế và niềm hạnh phúc trọn vẹn trong từng khoảnh khắc."
      : "Wishing you warmth, timeless elegance, and effortless grace in every step.");

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-[#d4af37]/40 bg-gradient-to-b from-[#fdfbf7] to-[#f7f3eb] p-5 shadow-xs">
      {/* Decorative watermark */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-[#d4af37]/10 blur-xl" />

      {/* Header Pill */}
      <div className="flex items-center justify-between border-b border-[#efe7dc] pb-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-[#b5573a] uppercase">
          <Sparkles className="size-3" />
          <span>{t("giftCustomizer.previewBadge")}</span>
        </div>
        <span className="text-[9px] font-medium tracking-widest text-[#1c1a18]/40 uppercase">
          Vela Stationery Atelier
        </span>
      </div>

      {/* Stationery Content */}
      <div className="relative pt-3.5 pb-2">
        {/* Wax Seal Motif */}
        <div className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-[#9b3a28] text-white shadow-xs">
          <Sparkle className="size-3.5 fill-white" />
        </div>

        <div className="font-serif text-xs font-semibold tracking-wide text-[#1c1a18]">
          To:{" "}
          <span className="underline decoration-[#d4af37]/50 underline-offset-4">{recipient}</span>
        </div>

        <p className="mt-3 font-serif text-[13px] leading-relaxed text-[#1c1a18]/85 italic">
          &ldquo;{message}&rdquo;
        </p>

        <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-[#1c1a18]/65">
          <span className="font-serif italic">— With warmth & love,</span>
          <span className="font-semibold text-[#1c1a18]">{sender}</span>
        </div>
      </div>
    </div>
  );
}

function GiftCardSection({ options, updateOptions }: SubcomponentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 pt-2">
      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#1c1a18]">
        <input
          type="checkbox"
          checked={options.includeCard}
          onChange={(e) => updateOptions({ includeCard: e.target.checked })}
          className="size-4 cursor-pointer rounded-sm border-[#1c1a18]/30 text-[#b5573a] accent-[#b5573a]"
        />
        <div className="flex items-center gap-1.5">
          <PenTool className="size-3.5 text-[#b5573a]" />
          <span>{t("giftCustomizer.cardCheckbox")}</span>
        </div>
      </label>

      <div
        className={cn(
          "accordion-drawer",
          options.includeCard ? "accordion-drawer-open" : "accordion-drawer-closed",
        )}
        aria-hidden={!options.includeCard}
        inert={!options.includeCard ? true : undefined}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3.5 pt-1 sm:pl-6">
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
                  className="mt-1 w-full rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
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
                  className="mt-1 w-full rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
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
                className="mt-1 w-full resize-none rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3 py-2 text-xs text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/30 focus:border-[#b5573a] focus:bg-white focus:outline-hidden"
              />
            </div>

            <GiftCardPreview options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GiftCustomizer({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { options, updateOptions, isLoaded } = useGiftOptions();
  const [hasEverOpened, setHasEverOpened] = useState(options.enabled);
  const isDrawerMounted = options.enabled || hasEverOpened;

  if (!isLoaded) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#efe7dc] bg-white p-5 shadow-2xs transition-[border-color,box-shadow] duration-200",
        options.enabled && "border-[#d4af37]/60 shadow-sm",
        className,
      )}
    >
      {/* Header Toggle */}
      <label className="flex cursor-pointer items-start gap-3.5">
        <input
          type="checkbox"
          checked={options.enabled}
          onChange={(e) => {
            setHasEverOpened(true);
            updateOptions({ enabled: e.target.checked });
          }}
          className="mt-0.5 size-4 cursor-pointer rounded-sm border-[#1c1a18]/30 text-[#b5573a] accent-[#b5573a]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-[#b5573a]" />
            <span className="font-serif text-sm font-medium tracking-wide text-[#1c1a18]">
              {t("giftCustomizer.title")}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#1c1a18]/60">{t("giftCustomizer.checkbox")}</p>
        </div>
      </label>

      {/* Expanded Gift Customization Drawer */}
      {isDrawerMounted && (
        <div
          className={cn(
            "accordion-drawer",
            options.enabled ? "accordion-drawer-open" : "accordion-drawer-closed",
          )}
          aria-hidden={!options.enabled}
          inert={!options.enabled ? true : undefined}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-5 space-y-5 border-t border-[#efe7dc] pt-5">
              <GiftBoxSelector options={options} updateOptions={updateOptions} />
              <GiftCardSection options={options} updateOptions={updateOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
