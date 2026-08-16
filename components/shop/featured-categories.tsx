"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import { useI18n } from "@/components/providers/i18n-provider";

export interface Category {
  id: string;
  name: string;
  image: string;
  link: string;
}

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
      {categories.map((category, index) => (
        <ScrollReveal
          key={category.id}
          direction="up"
          delay={index * 0.15} // Staggered delays
          duration={0.8}
        >
          <Link
            href={category.link}
            className="block cursor-pointer overflow-hidden rounded-none shadow-sm"
          >
            <motion.div
              className="group relative block aspect-[3/4] h-full w-full bg-[#efe7dc]"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(min-width: 1800px) 536px, (min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
              />

              {/* Light overlay */}
              <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/20" />

              {/* Gradient overlay from bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Label Info */}
              <div className="absolute right-8 bottom-8 left-8 z-10 flex flex-col items-start text-white">
                <h3 className="mb-3 font-serif text-3xl font-light tracking-wide text-[#f7f4ef] uppercase transition-colors group-hover:text-white md:text-4xl">
                  {category.name}
                </h3>

                {/* Animated CTA */}
                <div className="relative flex items-center gap-2 pb-1 text-xs font-semibold tracking-[1.5px] text-[#f7f4ef]/90 uppercase transition-colors group-hover:text-white">
                  <span>{t("storefront.home.shopNow")}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />

                  {/* Underline expansion */}
                  <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#f7f4ef] transition-all duration-300 ease-out group-hover:w-full" />
                </div>
              </div>
            </motion.div>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
