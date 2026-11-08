"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface SocialProofPillProps {
  productId: string | number;
  stockQuantity?: number | null;
  className?: string;
}

export function SocialProofPill({
  productId,
  stockQuantity,
  className = "",
}: SocialProofPillProps) {
  const { t } = useI18n();

  // Deterministic viewers & low stock calculation based on product ID to avoid hydration mismatch
  const { viewersCount, isLowStock, remainingCount } = useMemo(() => {
    const numericSeed = String(productId)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const viewers = (numericSeed % 6) + 3; // 3 to 8 viewers
    const isLow =
      typeof stockQuantity === "number"
        ? stockQuantity > 0 && stockQuantity <= 5
        : numericSeed % 3 === 0;
    const remaining =
      typeof stockQuantity === "number" && stockQuantity > 0
        ? stockQuantity
        : (numericSeed % 4) + 2;

    return {
      viewersCount: viewers,
      isLowStock: isLow,
      remainingCount: remaining,
    };
  }, [productId, stockQuantity]);

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1.5 rounded-xl border border-[#efe7dc] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#1c1a18]/80 shadow-2xs sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
      aria-live="polite"
    >
      {/* Live viewing pulse */}
      <div className="flex items-center gap-2">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-medium text-[#1c1a18]">
          {t("socialProof.viewingNow", { count: viewersCount })}
        </span>
      </div>

      {isLowStock ? (
        <div className="flex items-center gap-1.5 font-medium text-[#b5573a] sm:border-l sm:border-[#efe7dc] sm:pl-3">
          <Flame className="size-3.5 shrink-0 text-[#b5573a]" />
          <span>{t("socialProof.lowStock", { count: remainingCount })}</span>
        </div>
      ) : null}
    </div>
  );
}
