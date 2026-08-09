"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";
import { EASE_VELA } from "@/lib/motion-tokens";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.45,
  distance = 20,
  className = "",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  // Determine initial coordinates based on slide direction
  const getVariants = () => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 0, transform: "none" },
        visible: { opacity: 1, transform: "none" },
      };
    }

    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, transform: `translateY(${distance}px)` },
          visible: { opacity: 1, transform: "translateY(0px)" },
        };
      case "down":
        return {
          hidden: { opacity: 0, transform: `translateY(-${distance}px)` },
          visible: { opacity: 1, transform: "translateY(0px)" },
        };
      case "left":
        return {
          hidden: { opacity: 0, transform: `translateX(${distance}px)` },
          visible: { opacity: 1, transform: "translateX(0px)" },
        };
      case "right":
        return {
          hidden: { opacity: 0, transform: `translateX(-${distance}px)` },
          visible: { opacity: 1, transform: "translateX(0px)" },
        };
      case "none":
        return {
          hidden: { opacity: 0, transform: "scale(0.96)" },
          visible: { opacity: 1, transform: "scale(1)" },
        };
      default:
        return {
          hidden: { opacity: 0, transform: `translateY(${distance}px)` },
          visible: { opacity: 1, transform: "translateY(0px)" },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      // once: true keeps content displayed after first scroll reveal
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduceMotion ? 0.2 : duration,
        delay: delay,
        ease: EASE_VELA,
      }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}
