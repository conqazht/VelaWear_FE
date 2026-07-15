"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import { useI18n } from "@/components/providers/i18n-provider";

const ARCHIVE_ITEMS = [
  {
    id: "01",
    categoryKey: "storefront.story.item1Category",
    titleKey: "storefront.story.item1Title",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop",
    link: "/collection",
    gridClass: "md:col-span-2 aspect-[4/3] md:aspect-[2.1/1]",
  },
  {
    id: "02",
    categoryKey: "storefront.story.item2Category",
    titleKey: "storefront.story.item2Title",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "03",
    categoryKey: "storefront.story.item3Category",
    titleKey: "storefront.story.item3Title",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "04",
    categoryKey: "storefront.story.item4Category",
    titleKey: "storefront.story.item4Title",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "05",
    categoryKey: "storefront.story.item5Category",
    titleKey: "storefront.story.item5Title",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
] as const;

export function StorySection() {
  const { t } = useI18n();

  return (
    <section className="bg-[#efe7dc]/40 text-[#1c1a18] py-24 md:py-32 overflow-hidden relative border-y border-[#e3dccf]/50">
      {/* Decorative typo watermark */}
      <div className="absolute right-0 top-1/4 text-[22vw] font-bold text-[#b5573a]/[0.015] tracking-widest uppercase select-none pointer-events-none font-serif leading-none">
        VELA
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <ScrollReveal direction="right">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <span className="text-[11px] font-semibold uppercase tracking-[2.5px] text-[#b5573a]">
                {t("storefront.story.eyebrow")}
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight tracking-tight mb-6 text-[#1c1a18]">
              {t("storefront.story.title")}
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#8a857c] font-light max-w-xl">
              {t("storefront.story.description")}
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {ARCHIVE_ITEMS.map((item, index) => {
            const title = t(item.titleKey);

            return (
            <ScrollReveal
              key={item.id}
              direction="up"
              delay={index * 0.1}
              className={item.gridClass}
            >
              <Link href={item.link} className="w-full h-full block overflow-hidden rounded-[24px] shadow-lg cursor-pointer border border-[#e3dccf]/50">
                <motion.div
                  className="group relative w-full h-full block bg-[#efe7dc]"
                  whileHover="hover"
                >
                  {/* Background Image */}
                  <motion.img
                    suppressHydrationWarning
                    src={item.image}
                    alt={title}
                    className="w-full h-full object-cover select-none filter brightness-[0.85] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                    variants={{
                      hover: { scale: 1.05 },
                    }}
                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/95" />

                  {/* Card Content */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#ffb59f] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {item.id}
                      </span>
                      <span className="text-[10px] uppercase tracking-[1.5px] text-[#ffb59f] font-medium">
                        {t(item.categoryKey)}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <h3 className="font-serif text-xl md:text-2xl text-white font-light tracking-tight group-hover:text-[#ffb59f] transition-colors duration-300">
                        {title}
                      </h3>

                      {/* Floating Arrow Icon */}
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-[#b5573a] group-hover:border-[#b5573a] transition-all duration-300 flex-none"
                        variants={{
                          hover: { rotate: 45, scale: 1.1 },
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
