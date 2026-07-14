"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {categories.map((category, index) => (
        <ScrollReveal
          key={category.id}
          direction="up"
          delay={index * 0.15} // Staggered delays
          duration={0.8}
        >
          <Link href={category.link} className="block overflow-hidden rounded-none shadow-sm cursor-pointer">
            <motion.div
              className="group relative aspect-[3/4] w-full h-full block bg-[#efe7dc]"
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
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

              {/* Gradient overlay from bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Label Info */}
              <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col items-start text-white">
                <h3 className="font-serif text-3xl md:text-4xl text-[#f7f4ef] font-light uppercase tracking-wide mb-3 group-hover:text-white transition-colors">
                  {category.name}
                </h3>

                {/* Animated CTA */}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#f7f4ef]/90 group-hover:text-white transition-colors pb-1 relative">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />

                  {/* Underline expansion */}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#f7f4ef] group-hover:w-full transition-all duration-300 ease-out" />
                </div>
              </div>
            </motion.div>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
