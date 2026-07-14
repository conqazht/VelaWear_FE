"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProductsQuery } from "@/lib/queries/catalog";
import {
  getCategoryLabel,
  mapBackendProduct,
  money,
  PRODUCTS,
  type Product,
} from "@/lib/vela-data";
import { getActiveLocale } from "@/lib/i18n";

interface RelatedProductsProps {
  categoryId?: number;
  categoryCode: string;
  currentProductSlug: string;
}

export function RelatedProducts({
  categoryId,
  categoryCode,
  currentProductSlug,
}: RelatedProductsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activeLocale = getActiveLocale();

  // Fetch products in the same category
  const productsQuery = useProductsQuery({
    categoryId: categoryId,
    size: 12,
    locale: activeLocale,
  });

  const recommendedProducts = useMemo(() => {
    let list: Product[] = [];
    if (productsQuery.data?.result && productsQuery.data.result.length > 0) {
      list = productsQuery.data.result.map((p) => mapBackendProduct(p, activeLocale));
    } else {
      // Fallback: get all static products of the same category
      list = PRODUCTS.filter((p) => p.category === categoryCode);
      if (list.length === 0) {
        list = PRODUCTS;
      }
    }
    // Filter out the current product
    return list.filter((p) => p.id !== currentProductSlug).slice(0, 8);
  }, [productsQuery.data, currentProductSlug, categoryCode, activeLocale]);

  // Monitor scroll state
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [recommendedProducts]);

  // Scroll handler
  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full mt-16 pt-16 border-t border-[#1c1a18]/10">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8 select-none">
        <h2 className="font-serif text-2xl font-light tracking-wide text-[#1c1a18] md:text-3xl">
          You Might Also Like
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#efe7dc] text-[#1c1a18] border border-[#e3dccf]/30 hover:bg-[#b5573a] hover:text-white hover:border-[#b5573a] transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#efe7dc] text-[#1c1a18] border border-[#e3dccf]/30 hover:bg-[#b5573a] hover:text-white hover:border-[#b5573a] transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slider Viewport Container */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {recommendedProducts.map((product) => {
          const displayCategory = getCategoryLabel(product.category, "en");

          return (
            <motion.div
              key={product.id}
              className="min-w-[240px] sm:min-w-[280px] md:min-w-[320px] max-w-[340px] flex-none snap-start group"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Image box with no borders/shadows */}
              <div className="relative aspect-[3/4] w-full bg-[#efe7dc] overflow-hidden">
                <Link href={`/products/${product.id}`} className="relative block h-full w-full">
                    <Image
                      suppressHydrationWarning
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 340px, (min-width: 640px) 280px, 240px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                </Link>
              </div>

              {/* Text Info */}
              <div className="pt-4 flex flex-col text-left">
                {/* Title */}
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="font-serif text-[18px] font-medium leading-snug text-[#1c1a18] hover:text-[#b5573a] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                {/* Subtitle / Category */}
                <p className="text-[11px] uppercase tracking-[1.5px] text-[#8a857c] font-medium mt-1">
                  {displayCategory}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-[#1c1a18] font-numeric">
                    {money(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-[#8a857c] line-through font-numeric">
                      {money(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
