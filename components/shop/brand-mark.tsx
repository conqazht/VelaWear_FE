"use client";

import Image from "next/image";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Image
      suppressHydrationWarning
      src="/logo.png"
      alt={t("brand.logoAlt")}
      width={40}
      height={40}
      className={cn("h-10 w-auto object-contain select-none", className)}
      priority
    />
  );
}
