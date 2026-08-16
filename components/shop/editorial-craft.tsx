"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Compass, Sparkles, Sliders, Flower2 } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { useI18n } from "@/components/providers/i18n-provider";

const STEPS = [
  {
    id: "step-1",
    num: "01",
    titleKey: "storefront.craft.step1Title",
    subtitleKey: "storefront.craft.step1Subtitle",
    descriptionKey: "storefront.craft.step1Description",
    image: "/images/home/editorial/materials-and-draping.webp",
    icon: Flower2,
  },
  {
    id: "step-2",
    num: "02",
    titleKey: "storefront.craft.step2Title",
    subtitleKey: "storefront.craft.step2Subtitle",
    descriptionKey: "storefront.craft.step2Description",
    image: "/images/home/editorial/artisan-weaving.webp",
    icon: Compass,
  },
  {
    id: "step-3",
    num: "03",
    titleKey: "storefront.craft.step3Title",
    subtitleKey: "storefront.craft.step3Subtitle",
    descriptionKey: "storefront.craft.step3Description",
    image: "/images/home/editorial/precision-tailoring.webp",
    icon: Sliders,
  },
  {
    id: "step-4",
    num: "04",
    titleKey: "storefront.craft.step4Title",
    subtitleKey: "storefront.craft.step4Subtitle",
    descriptionKey: "storefront.craft.step4Description",
    image: "/images/home/editorial/fine-packaging.webp",
    icon: Sparkles,
  },
] as const;

export function EditorialCraft() {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  // Monitor scrolling to pin the viewport and advance steps on desktop
  useEffect(() => {
    if (reduceMotion) return;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      // On mobile/tablet screens, disable sticky scroll mechanics to prevent content clipping
      if (window.innerWidth < 1024) return;

      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrollTop = -rect.top;
      const scrollHeight = rect.height - window.innerHeight;

      if (scrollHeight <= 0) return;

      const progress = Math.max(0, Math.min(0.999, scrollTop / scrollHeight));
      setScrollProgress(progress);

      // Divide overall progress into segments for each of the 4 steps
      const stepIndex = Math.floor(progress * STEPS.length);
      setActiveStep(stepIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reduceMotion]);

  // Autoplay step switching on mobile screens for fluid interaction
  useEffect(() => {
    if (reduceMotion || window.innerWidth >= 1024) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reduceMotion]);

  const handleStepClick = (index: number) => {
    if (window.innerWidth < 1024) {
      setActiveStep(index);
      return;
    }

    if (!scrollContainerRef.current) return;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const scrollHeight = rect.height - window.innerHeight;

    // Smoothly scroll window to target step's progress region
    const targetProgress = index / STEPS.length + 0.02;
    const targetScrollY = absoluteTop + targetProgress * scrollHeight;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  };

  const getStepProgressWidth = (index: number) => {
    if (scrollProgress === 0) {
      return index === activeStep ? "100%" : "0%";
    }

    const stepRange = 1 / STEPS.length;
    const stepStart = index * stepRange;
    const stepEnd = (index + 1) * stepRange;

    if (scrollProgress <= stepStart) return "0%";
    if (scrollProgress >= stepEnd) return "100%";

    const progressInStep = (scrollProgress - stepStart) / stepRange;
    return `${progressInStep * 100}%`;
  };

  return (
    <div
      ref={scrollContainerRef}
      className="relative border-t border-[#e3dccf]/60 bg-[#f7f4ef] lg:h-[320vh]"
    >
      <div className="overflow-hidden py-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
        <section id="editorial-craft" className="mx-auto w-full max-w-[1800px] px-6 md:px-16">
          {/* Title portion */}
          <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <ScrollReveal direction="up">
              <span className="mb-2 block text-[10px] font-semibold tracking-[2.5px] text-[#b5573a] uppercase">
                {t("storefront.craft.eyebrow")}
              </span>
              <h2 className="text-3.5xl font-serif font-light tracking-tight text-[#1c1a18] md:text-5xl">
                {t("storefront.craft.title")}
              </h2>
              <p className="mt-3 text-xs leading-relaxed font-light text-[#8a857c] md:text-sm">
                {t("storefront.craft.description")}
              </p>
            </ScrollReveal>
          </div>

          {/* Content columns */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Interactive Steps Accordion */}
            <ScrollReveal
              direction="up"
              delay={0.1}
              className="flex flex-col gap-3.5 lg:col-span-7"
            >
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === activeStep;

                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`relative cursor-pointer overflow-hidden rounded-[12px] border p-4 text-left transition-all duration-500 md:p-5 ${
                      isActive
                        ? "translate-x-1.5 border-[#b5573a]/40 bg-[#efe7dc] shadow-md"
                        : "border-[#e3dccf]/40 bg-transparent hover:border-[#b5573a]/20 hover:bg-[#efe7dc]/20"
                    }`}
                  >
                    {/* Progress Bar */}
                    <div
                      className="absolute bottom-0 left-0 h-[3px] bg-[#b5573a] transition-all duration-150 ease-out"
                      style={{ width: getStepProgressWidth(index) }}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Number */}
                        <span
                          className={`font-serif text-lg leading-none font-light md:text-xl ${
                            isActive ? "text-[#b5573a]" : "text-[#8a857c]"
                          }`}
                        >
                          {step.num}
                        </span>

                        <div>
                          <p className="text-[9px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                            {t(step.titleKey)}
                          </p>
                          <h3 className="mt-0.5 font-serif text-sm font-medium text-[#1c1a18] md:text-base">
                            {t(step.subtitleKey)}
                          </h3>
                        </div>
                      </div>

                      {/* Rotating Icon */}
                      <motion.div
                        className={`flex h-8.5 w-8.5 items-center justify-center rounded-full border transition-colors ${
                          isActive
                            ? "border-transparent bg-[#b5573a] text-white"
                            : "border-[#e3dccf] bg-[#efe7dc]/50 text-[#1c1a18]"
                        }`}
                        animate={{ rotate: isActive ? 360 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <StepIcon className="h-3.5 w-3.5" />
                      </motion.div>
                    </div>

                    {/* Description Accordion Body */}
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl border-l border-[#b5573a] pr-2 pl-4 text-xs leading-relaxed font-light text-[#3d3a36]">
                            {t(step.descriptionKey)}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </ScrollReveal>

            {/* Right Column: Image Showcase */}
            <ScrollReveal
              direction="up"
              delay={0.25}
              className="flex items-center justify-center lg:col-span-5"
            >
              <div className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-[20px] border border-[#e3dccf]/80 bg-[#efe7dc] shadow-2xl">
                {/* Image Transition */}
                <AnimatePresence mode="wait">
                  <motion.img
                    suppressHydrationWarning
                    key={activeStep}
                    src={STEPS[activeStep].image}
                    alt={t(STEPS[activeStep].titleKey)}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.55,
                      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
                    }}
                    className="absolute inset-0 h-full w-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Bottom Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Progress Count Badge */}
                <div className="absolute right-6 bottom-6 z-10 rounded-full border border-white/5 bg-[#1c1a18] px-3 py-1.5 font-mono text-[10px] tracking-[1px] text-[#f7f4ef] shadow-lg">
                  {activeStep + 1} / {STEPS.length}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  );
}
