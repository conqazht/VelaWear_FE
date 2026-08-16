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
    image: "/images/home/editorial/materials-and-draping.webp",
    link: "/collection",
    gridClass: "md:col-span-2 aspect-[4/3] md:aspect-[2.1/1]",
  },
  {
    id: "02",
    categoryKey: "storefront.story.item2Category",
    titleKey: "storefront.story.item2Title",
    image: "/images/home/editorial/minimal-tailoring.webp",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "03",
    categoryKey: "storefront.story.item3Category",
    titleKey: "storefront.story.item3Title",
    image: "/images/home/editorial/botanical-dye.webp",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "04",
    categoryKey: "storefront.story.item4Category",
    titleKey: "storefront.story.item4Title",
    image: "/images/home/editorial/artisan-structure.webp",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
  {
    id: "05",
    categoryKey: "storefront.story.item5Category",
    titleKey: "storefront.story.item5Title",
    image: "/images/home/editorial/artisan-weaving.webp",
    link: "/collection",
    gridClass: "aspect-[3/4] md:aspect-[1/1.25]",
  },
] as const;

export function StorySection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-y border-[#e3dccf]/50 bg-[#efe7dc]/40 py-24 text-[#1c1a18] md:py-32">
      {/* Decorative typo watermark */}
      <div className="pointer-events-none absolute top-1/4 right-0 font-serif text-[22vw] leading-none font-bold tracking-widest text-[#b5573a]/[0.015] uppercase select-none">
        VELA
      </div>

      <div className="relative z-10 mx-auto max-w-[1800px] px-6 md:px-16">
        {/* Header Section */}
        <div className="mb-16 max-w-2xl md:mb-20">
          <ScrollReveal direction="right">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b5573a]" />
              <span className="text-[11px] font-semibold tracking-[2.5px] text-[#b5573a] uppercase">
                {t("storefront.story.eyebrow")}
              </span>
            </div>
            <h2 className="mb-6 font-serif text-4xl leading-tight font-light tracking-tight text-[#1c1a18] md:text-6xl">
              {t("storefront.story.title")}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed font-light text-[#8a857c] md:text-base">
              {t("storefront.story.description")}
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {ARCHIVE_ITEMS.map((item, index) => {
            const title = t(item.titleKey);

            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                delay={index * 0.1}
                className={item.gridClass}
              >
                <Link
                  href={item.link}
                  className="block h-full w-full cursor-pointer overflow-hidden rounded-[24px] border border-[#e3dccf]/50 shadow-lg"
                >
                  <motion.div
                    className="group relative block h-full w-full bg-[#efe7dc]"
                    whileHover="hover"
                  >
                    {/* Background Image */}
                    <motion.img
                      suppressHydrationWarning
                      src={item.image}
                      alt={title}
                      className="h-full w-full object-cover brightness-[0.85] contrast-[1.05] filter select-none"
                      referrerPolicy="no-referrer"
                      variants={{
                        hover: { scale: 1.05 },
                      }}
                      transition={{
                        duration: 1.2,
                        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
                      }}
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/95" />

                    {/* Card Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                      <div className="mb-2 flex items-center gap-2.5">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] tracking-widest text-[#ffb59f] uppercase">
                          {item.id}
                        </span>
                        <span className="text-[10px] font-medium tracking-[1.5px] text-[#ffb59f] uppercase">
                          {t(item.categoryKey)}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <h3 className="font-serif text-xl font-light tracking-tight text-white transition-colors duration-300 group-hover:text-[#ffb59f] md:text-2xl">
                          {title}
                        </h3>

                        {/* Floating Arrow Icon */}
                        <motion.div
                          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#b5573a] group-hover:bg-[#b5573a]"
                          variants={{
                            hover: { rotate: 45, scale: 1.1 },
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
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
