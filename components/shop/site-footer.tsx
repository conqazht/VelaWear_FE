"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";

export function SiteFooter() {
  const isLandingPage = usePathname() === "/";
  const { t } = useI18n();
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <footer className="mt-auto bg-[#121110] text-[#f7f4ef] border-t border-white/5 pt-10 md:pt-12 pb-16 transition-all duration-300 relative overflow-hidden">
      {/* Huge low-opacity typography watermark behind the footer */}
      <motion.div
        initial={isLandingPage ? { opacity: 0, scale: 0.95 } : false}
        whileInView={isLandingPage ? { opacity: 1, scale: 1 } : undefined}
        viewport={isLandingPage ? { once: true } : undefined}
        transition={isLandingPage ? { duration: 1.5, ease: "easeOut" } : undefined}
        className="absolute left-10 bottom-0 text-[18vw] font-bold text-white/[0.012] tracking-widest uppercase select-none pointer-events-none font-serif leading-none"
      >
        VELA
      </motion.div>

      <motion.div
        className="mx-auto w-full max-w-[1800px] px-6 md:px-16 relative z-10"
        variants={containerVariants}
        initial={isLandingPage ? "hidden" : false}
        whileInView={isLandingPage ? "show" : undefined}
        viewport={isLandingPage ? { once: true, margin: "-80px" } : undefined}
      >
        <div className="grid grid-cols-1 gap-16 border-b border-white/5 pb-20 md:grid-cols-[minmax(0,1fr)_180px_180px_220px] md:items-start md:justify-between md:gap-10">
          {/* Column 1: Elegant Branding, slogan, and description */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 flex flex-col items-start pr-0 md:max-w-[440px] md:pr-6"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-none mb-4">
              Vela.
            </h2>
            <p className="font-serif italic text-[#b5573a] text-lg md:text-xl tracking-wide mb-6">
              {t("storefront.footer.tagline")}
            </p>
            <p className="text-[#a89e93] text-sm leading-relaxed max-w-sm font-light">
              {t("storefront.footer.description")}
            </p>
          </motion.div>

          {/* Column 2: Collection */}
          <motion.div variants={itemVariants} className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                {t("storefront.footer.collection")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  {t("storefront.footer.autumnCollection")}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  {t("storefront.footer.minimalistTailoring")}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  {t("storefront.footer.slowWeaving")}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Studio */}
          <motion.div variants={itemVariants} className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                {t("storefront.footer.studio")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  {t("storefront.footer.vision")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  {t("storefront.footer.ethics")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  {t("storefront.footer.journal")}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div variants={itemVariants} className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                {t("storefront.footer.contact")}
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="mailto:hello@velawear.vn" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light break-all">
                  hello@velawear.vn
                </a>
              </li>
              <li className="text-sm text-[#a89e93] font-light">
                +84 (0) 902 345 678
              </li>
              <li className="text-sm text-[#a89e93] font-light">
                {t("storefront.footer.location")}
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#a89e93]/50 font-light"
        >
          <p>{t("storefront.footer.rights")}</p>
          
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">{t("storefront.footer.instagram")}</a>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <a href="#" className="hover:text-white transition-colors">{t("storefront.footer.pinterest")}</a>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <a href="#" className="hover:text-white transition-colors">{t("storefront.footer.facebook")}</a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
