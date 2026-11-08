"use client";

import { useMemo } from "react";
import { Eye, Flame } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

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
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-[#efe7dc] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#1c1a18]/80 ${className}`}
      aria-live="polite"
    >
      {/* Live viewing pulse */}
      <div className="flex items-center gap-1.5 font-medium">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <Eye className="size-3.5 text-[#1c1a18]/60" />
        <span>{t("socialProof.viewingNow", { count: viewersCount })}</span>
      </div>

      {isLowStock ? (
        <>
          <span className="text-[#1c1a18]/30">•</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#b5573a]">
            <Flame className="size-3.5 text-[#b5573a]" />
            <span>{t("socialProof.lowStock", { count: remainingCount })}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
