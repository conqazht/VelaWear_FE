"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { BrandMark } from "@/components/shop/brand-mark";

interface AuthShellProps {
  children: ReactNode;
  includeHeader?: boolean;
  className?: string;
}

export function AuthShell({ children, includeHeader = false, className }: AuthShellProps) {
  const { t } = useI18n();

  return (
    <main className="relative min-h-screen bg-[#f7f4ef] text-[#1c1a18]">
      <LanguageSwitcher className="absolute top-5 right-5 z-50 border-[#1c1a18]/15 bg-[#f7f4ef]/90 shadow-sm md:top-7 md:right-7" />
      {includeHeader && (
        <header className="flex h-[71px] items-center justify-center border-b border-[#e3dccf] bg-[#f7f4ef] px-4">
          <Link
            href="/"
            aria-label={t("auth.common.homeAria")}
            className="inline-block transition-opacity hover:opacity-90"
          >
            <BrandMark />
          </Link>
        </header>
      )}
      <div className={className}>{children}</div>
    </main>
  );
}
