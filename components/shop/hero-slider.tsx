"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAutoplay, setIsAutoplay] = useState(true);
  const router = useRouter();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isAutoplay || reduceMotion) return;
    const interval = setInterval(() => {
      setDirection("right");
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoplay, reduceMotion, slides.length]);

  const handlePrev = () => {
    setIsAutoplay(false);
    setDirection("left");
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection("right");
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section
      className="group/hero relative h-[700px] w-full overflow-hidden bg-[#efe7dc] md:h-[820px]"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 32 },
            opacity: { duration: 0.5 },
          }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Background Image */}
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            sizes="100vw"
            priority={current === 0}
            className="object-cover select-none"
          />

          {/* Subtly dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a18]/70 via-[#1c1a18]/25 to-transparent" />

          {/* Header gradient vignette to guarantee header readability */}
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-44 bg-gradient-to-b from-black/60 via-black/15 to-transparent" />

          {/* Content area */}
          <div className="absolute inset-0 flex items-end px-6 pb-24 md:px-12 md:pb-32">
            <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center text-center">
              {/* Subtitle */}
              <motion.span
                initial={{ opacity: 0, transform: "translateY(15px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 block text-[11px] font-semibold tracking-[2.5px] text-[#ffb59f] uppercase md:text-xs"
              >
                {slides[current].subtitle}
              </motion.span>

              {/* Serif Title */}
              <motion.h1
                initial={{ opacity: 0, transform: "translateY(20px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 max-w-4xl font-serif text-4xl leading-tight font-light tracking-tight text-[#f7f4ef] sm:text-5xl md:text-7xl"
              >
                {slides[current].title}
              </motion.h1>

              {/* Call-to-action button */}
              <motion.button
                initial={{ opacity: 0, transform: "translateY(15px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-[#b5573a] px-10 py-4.5 text-sm font-medium tracking-[1.5px] text-white uppercase shadow-lg transition-colors duration-300 hover:bg-[#8f4329]"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/collection")}
              >
                {slides[current].ctaText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="pointer-events-none absolute inset-x-6 top-1/2 z-30 flex -translate-y-1/2 items-center justify-between opacity-0 transition-opacity duration-300 group-focus-within/hero:opacity-100 group-hover/hero:opacity-100">
        <motion.button
          onClick={handlePrev}
          className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/15 text-[#f7f4ef] backdrop-blur-sm hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1a18] focus-visible:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t("storefront.home.previousSlide")}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/15 text-[#f7f4ef] backdrop-blur-sm hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1a18] focus-visible:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t("storefront.home.nextSlide")}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoplay(false);
              setDirection(i > current ? "right" : "left");
              setCurrent(i);
            }}
            className="group relative cursor-pointer rounded-full p-1 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1a18] focus-visible:outline-none"
            aria-label={t("storefront.home.goToSlide", { number: i + 1 })}
          >
            <div
              className={`size-2 rounded-full transition-all duration-300 ease-out ${
                i === current
                  ? "bg-white opacity-100 shadow-xs"
                  : "bg-white/45 opacity-90 group-hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
