"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLocalizedFixtureProducts } from "@/lib/i18n/fixture-catalog";
import { useProductsQuery } from "@/lib/queries/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCategoryLabel,
  mapBackendProduct,
  money,
  type Product,
} from "@/lib/vela-data";

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
  const { locale: activeLocale, t } = useI18n();

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
    } else if (!productsQuery.isPending) {
      // Fallback: get all static products of the same category
      const fixtureProducts = getLocalizedFixtureProducts(activeLocale);
      list = fixtureProducts.filter((p) => p.category === categoryCode);
      if (list.length === 0) {
        list = fixtureProducts;
      }
    }
    // Filter out the current product
    return list.filter((p) => p.id !== currentProductSlug).slice(0, 8);
  }, [productsQuery.data, productsQuery.isPending, currentProductSlug, categoryCode, activeLocale]);

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

  if (productsQuery.isPending && !productsQuery.data) {
    return <RelatedProductsLoading title={t("storefront.product.related")} />;
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full mt-16 pt-16 border-t border-[#1c1a18]/10">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8 select-none">
        <h2 className="font-serif text-2xl font-light tracking-wide text-[#1c1a18] md:text-3xl">
          {t("storefront.product.related")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#efe7dc] text-[#1c1a18] border border-[#e3dccf]/30 hover:bg-[#b5573a] hover:text-white hover:border-[#b5573a] transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            aria-label={t("storefront.common.scrollLeft")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#efe7dc] text-[#1c1a18] border border-[#e3dccf]/30 hover:bg-[#b5573a] hover:text-white hover:border-[#b5573a] transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            aria-label={t("storefront.common.scrollRight")}
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
          const displayCategory = getCategoryLabel(product.category, activeLocale);

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
                    {money(product.price, activeLocale)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-[#8a857c] line-through font-numeric">
                      {money(product.originalPrice, activeLocale)}
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

function RelatedProductsLoading({ title }: { title: string }) {
  return (
    <section
      className="mt-16 w-full border-t border-[#1c1a18]/10 pt-16"
      aria-busy="true"
    >
      <div className="mb-8 flex items-center justify-between select-none">
        <h2 className="font-serif text-2xl font-light tracking-wide text-[#1c1a18] md:text-3xl">
          {title}
        </h2>
        <div className="flex gap-2" aria-hidden="true">
          <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
          <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
        </div>
      </div>

      <div
        className="flex gap-6 overflow-hidden px-1 pb-4"
        aria-hidden="true"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-w-[240px] max-w-[340px] flex-none sm:min-w-[280px] md:min-w-[320px]"
          >
            <Skeleton className="aspect-[3/4] w-full rounded-none bg-[#efe7dc]" />
            <div className="flex flex-col pt-4 text-left">
              <Skeleton className="h-5 w-4/5 bg-[#efe7dc]" />
              <Skeleton className="mt-2 h-3 w-2/5 bg-[#efe7dc]" />
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-4 w-20 bg-[#efe7dc]" />
                <Skeleton className="h-3 w-16 bg-[#efe7dc]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
