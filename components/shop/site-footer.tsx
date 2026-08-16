"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/5 bg-[#121110] pt-10 pb-16 text-[#f7f4ef] transition-all duration-300 md:pt-12">
      {/* Huge low-opacity typography watermark behind the footer */}
      <div
        className="pointer-events-none absolute bottom-0 left-10 font-serif text-[18vw] leading-none font-bold tracking-widest text-white/[0.015] uppercase select-none"
        aria-hidden="true"
      >
        VELA
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 md:px-16">
        <div className="grid grid-cols-1 gap-16 border-b border-white/5 pb-20 md:grid-cols-[minmax(0,1fr)_180px_180px_220px] md:items-start md:justify-between md:gap-10">
          {/* Column 1: Elegant Branding, slogan, and description */}
          <div className="col-span-1 flex flex-col items-start pr-0 md:max-w-[440px] md:pr-6">
            <h2 className="mb-4 font-serif text-5xl leading-none font-bold tracking-tight text-white uppercase md:text-7xl">
              Vela.
            </h2>
            <p className="mb-6 font-serif text-lg tracking-wide text-[#b5573a] italic md:text-xl">
              {t("storefront.footer.tagline")}
            </p>
            <p className="max-w-sm text-sm leading-relaxed font-light text-[#a89e93]">
              {t("storefront.footer.description")}
            </p>
          </div>

          {/* Column 2: Collection */}
          <div className="col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold tracking-[2px] text-white uppercase">
                {t("storefront.footer.collection")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.autumnCollection")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.minimalistTailoring")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.slowWeaving")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio */}
          <div className="col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold tracking-[2px] text-white uppercase">
                {t("storefront.footer.studio")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/help"
                  className="text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.vision")}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.ethics")}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm font-light text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  {t("storefront.footer.journal")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold tracking-[2px] text-white uppercase">
                {t("storefront.footer.contact")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="mailto:hello@velawear.vn"
                  className="text-sm font-light break-all text-[#a89e93] transition-colors hover:text-[#ffb59f]"
                >
                  hello@velawear.vn
                </a>
              </li>
              <li className="text-sm font-light text-[#a89e93]">+84 (0) 902 345 678</li>
              <li className="text-sm font-light text-[#a89e93]">
                {t("storefront.footer.location")}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 text-xs font-light text-[#a89e93]/50 md:flex-row">
          <p>{t("storefront.footer.rights")}</p>

          <div className="flex items-center gap-8">
            <a href="#" className="transition-colors hover:text-white">
              {t("storefront.footer.instagram")}
            </a>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <a href="#" className="transition-colors hover:text-white">
              {t("storefront.footer.pinterest")}
            </a>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <a href="#" className="transition-colors hover:text-white">
              {t("storefront.footer.facebook")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
