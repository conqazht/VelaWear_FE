"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/vela-data";
import { HomeProductCard } from "./home-product-card";
import { useI18n } from "@/components/providers/i18n-provider";

interface HorizontalSliderProps {
  products: Product[];
}

export function HorizontalSlider({ products }: HorizontalSliderProps) {
  const { t } = useI18n();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Monitor scroll capabilities
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
  }, [products]);

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

  return (
    <div className="group/slider relative w-full">
      {/* Sliding Arrow Left */}
      <div className="absolute top-[35%] -left-4 z-30 transition-opacity duration-300 md:-left-6">
        <motion.button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#e3dccf] bg-[#f7f4ef] text-[#1c1a18] shadow-md transition-opacity duration-300 ${
            canScrollLeft
              ? "opacity-100 hover:border-[#b5573a] hover:bg-[#b5573a] hover:text-[#f7f4ef]"
              : "pointer-events-none opacity-0"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={t("carousel.scrollLeft")}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Sliding Arrow Right */}
      <div className="absolute top-[35%] -right-4 z-30 transition-opacity duration-300 md:-right-6">
        <motion.button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#e3dccf] bg-[#f7f4ef] text-[#1c1a18] shadow-md transition-opacity duration-300 ${
            canScrollRight
              ? "opacity-100 hover:border-[#b5573a] hover:bg-[#b5573a] hover:text-[#f7f4ef]"
              : "pointer-events-none opacity-0"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={t("carousel.scrollRight")}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Slider Viewport Container */}
      <div
        ref={sliderRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="max-w-[400px] min-w-[280px] flex-none snap-start sm:min-w-[340px] md:min-w-[380px]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <HomeProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
