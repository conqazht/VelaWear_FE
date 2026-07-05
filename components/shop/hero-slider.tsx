"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setDirection("right");
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoplay, slides.length]);

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
      className="relative w-full h-[700px] md:h-[820px] overflow-hidden group/hero bg-[#efe7dc]"
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
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <img
            suppressHydrationWarning
            src={slides[current].image}
            alt={slides[current].title}
            className="absolute inset-0 w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />

          {/* Subtly dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a18]/70 via-[#1c1a18]/25 to-transparent" />

          {/* Header gradient vignette to guarantee header readability */}
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/60 via-black/15 to-transparent pointer-events-none z-10" />

          {/* Content area */}
          <div className="absolute inset-0 flex items-end pb-24 md:pb-32 px-6 md:px-12">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center text-center">
              {/* Subtitle */}
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[11px] md:text-xs font-semibold uppercase tracking-[2.5px] text-[#ffb59f] mb-4"
              >
                {slides[current].subtitle}
              </motion.span>

              {/* Serif Title */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="font-serif text-4xl sm:text-5xl md:text-7xl text-[#f7f4ef] font-light leading-tight tracking-tight max-w-4xl mb-8"
              >
                {slides[current].title}
              </motion.h1>

              {/* Call-to-action button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-[#b5573a] hover:bg-[#8f4329] text-white font-medium text-sm tracking-[1.5px] uppercase px-10 py-4.5 rounded-[6px] transition-colors duration-300 shadow-lg cursor-pointer flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/collection")}
              >
                {slides[current].ctaText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-30 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 text-[#f7f4ef] backdrop-blur-sm pointer-events-auto cursor-pointer border border-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 text-[#f7f4ef] backdrop-blur-sm pointer-events-auto cursor-pointer border border-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoplay(false);
              setDirection(i > current ? "right" : "left");
              setCurrent(i);
            }}
            className="group relative py-2 px-1 focus:outline-none cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === current ? "w-10 bg-white" : "w-2.5 bg-white/40 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
