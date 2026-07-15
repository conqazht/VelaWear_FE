"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
    icon: Flower2,
  },
  {
    id: "step-2",
    num: "02",
    titleKey: "storefront.craft.step2Title",
    subtitleKey: "storefront.craft.step2Subtitle",
    descriptionKey: "storefront.craft.step2Description",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop",
    icon: Compass,
  },
  {
    id: "step-3",
    num: "03",
    titleKey: "storefront.craft.step3Title",
    subtitleKey: "storefront.craft.step3Subtitle",
    descriptionKey: "storefront.craft.step3Description",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600&auto=format&fit=crop",
    icon: Sliders,
  },
  {
    id: "step-4",
    num: "04",
    titleKey: "storefront.craft.step4Title",
    subtitleKey: "storefront.craft.step4Subtitle",
    descriptionKey: "storefront.craft.step4Description",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=600&auto=format&fit=crop",
    icon: Sparkles,
  },
] as const;

export function EditorialCraft() {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  // Monitor scrolling to pin the viewport and advance steps on desktop
  useEffect(() => {
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
  }, []);

  // Autoplay step switching on mobile screens for fluid interaction
  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

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
    <div ref={scrollContainerRef} className="relative lg:h-[320vh] bg-[#f7f4ef] border-t border-[#e3dccf]/60">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center py-16 lg:py-0 overflow-hidden">
        <section id="editorial-craft" className="max-w-[1800px] w-full mx-auto px-6 md:px-16">
          
          {/* Title portion */}
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <ScrollReveal direction="up">
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#b5573a] block mb-2">
                {t("storefront.craft.eyebrow")}
              </span>
              <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight text-[#1c1a18]">
                {t("storefront.craft.title")}
              </h2>
              <p className="text-[#8a857c] text-xs md:text-sm mt-3 font-light leading-relaxed">
                {t("storefront.craft.description")}
              </p>
            </ScrollReveal>
          </div>
  
          {/* Content columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left Column: Interactive Steps Accordion */}
            <ScrollReveal direction="up" delay={0.1} className="lg:col-span-7 flex flex-col gap-3.5">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === activeStep;
  
                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`p-4 md:p-5 rounded-[12px] border transition-all duration-500 cursor-pointer text-left relative overflow-hidden ${
                      isActive
                        ? "bg-[#efe7dc] border-[#b5573a]/40 shadow-md translate-x-1.5"
                        : "bg-transparent border-[#e3dccf]/40 hover:border-[#b5573a]/20 hover:bg-[#efe7dc]/20"
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
                        <span className={`font-serif text-lg md:text-xl font-light leading-none ${
                          isActive ? "text-[#b5573a]" : "text-[#8a857c]"
                        }`}>
                          {step.num}
                        </span>
                        
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8a857c]">
                            {t(step.titleKey)}
                          </p>
                          <h3 className="font-serif text-sm md:text-base font-medium text-[#1c1a18] mt-0.5">
                            {t(step.subtitleKey)}
                          </h3>
                        </div>
                      </div>
  
                      {/* Rotating Icon */}
                      <motion.div
                        className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border transition-colors ${
                          isActive ? "bg-[#b5573a] text-white border-transparent" : "bg-[#efe7dc]/50 text-[#1c1a18] border-[#e3dccf]"
                        }`}
                        animate={{ rotate: isActive ? 360 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
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
                          <p className="text-xs leading-relaxed text-[#3d3a36] font-light max-w-2xl pr-2 border-l border-[#b5573a] pl-4">
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
            <ScrollReveal direction="up" delay={0.25} className="lg:col-span-5 flex justify-center items-center">
              <div className="relative aspect-[3/4] w-full max-w-[340px] bg-[#efe7dc] overflow-hidden rounded-[20px] shadow-2xl border border-[#e3dccf]/80">
                
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
                    transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
  
                {/* Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
  
                {/* Progress Count Badge */}
                <div className="absolute bottom-6 right-6 bg-[#1c1a18] text-[#f7f4ef] text-[10px] font-mono px-3 py-1.5 rounded-full tracking-[1px] z-10 shadow-lg border border-white/5">
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
