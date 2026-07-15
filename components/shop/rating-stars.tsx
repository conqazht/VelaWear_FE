"use client";

import { Star } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number;
  className?: string;
  sizeClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function RatingStars({
  rating,
  className,
  sizeClassName = "size-4",
  activeClassName = "text-[#1c1a18]",
  inactiveClassName = "text-[#1c1a18]/15",
}: RatingStarsProps) {
  const { t } = useI18n();
  const normalizedRating = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={t("storefront.product.ratingAria", {
        rating: normalizedRating.toFixed(1),
      })}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fillRatio = Math.min(1, Math.max(0, normalizedRating - index));

        return (
          <span key={index} className={cn("relative block shrink-0", sizeClassName)}>
            <Star aria-hidden className={cn("absolute inset-0 size-full", inactiveClassName)} />
            {fillRatio > 0 && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star className={cn("max-w-none fill-current", sizeClassName, activeClassName)} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
