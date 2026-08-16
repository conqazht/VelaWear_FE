"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { useI18n } from "@/components/providers/i18n-provider";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useI18n();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() !== "") {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#121110] py-28 text-[#f7f4ef] md:py-36">
      {/* Background Soft Image Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08] select-none"
        style={{ backgroundImage: "url('/images/home/editorial/materials-and-draping.webp')" }}
      />

      {/* Radial soft lighting vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,87,58,0.12)_0%,rgba(18,17,16,0)_70%)]" />

      <div className="relative z-10 mx-auto flex max-w-[1800px] flex-col items-center px-6 text-center md:px-16">
        <ScrollReveal direction="up" className="flex max-w-2xl flex-col items-center">
          {/* Icon */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#ffb59f]">
            <Mail className="h-5 w-5" />
          </div>

          {/* Heading */}
          <h2 className="text-3.5xl mb-4 font-serif leading-tight font-light tracking-tight text-white md:text-5xl">
            {t("storefront.newsletter.title")}
          </h2>

          {/* Subtitle */}
          <p className="mb-10 max-w-xl text-sm leading-relaxed font-light text-[#a89e93] md:text-base">
            {t("storefront.newsletter.description")}
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-lg flex-col items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 transition-all duration-300 focus-within:border-[#b5573a]/50 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {t("storefront.newsletter.placeholder")}
            </label>
            <input
              type="email"
              id="newsletter-email"
              placeholder={t("storefront.newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-none bg-transparent px-6 py-3.5 text-sm text-white placeholder-white/30 focus:ring-0 focus:outline-none"
              required
            />

            <motion.button
              type="submit"
              className="flex w-full flex-none cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#f7f4ef] px-8 py-4 text-xs font-semibold tracking-[1.5px] text-[#121110] uppercase transition-colors duration-300 hover:bg-[#efe7dc] sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>
                {subscribed ? t("storefront.newsletter.joined") : t("storefront.newsletter.join")}
              </span>
              <ArrowRight className="h-4 w-4 text-[#b5573a]" />
            </motion.button>
          </form>

          {/* Feedback message */}
          <div className="mt-4 h-6" role="status" aria-live="polite" aria-atomic="true">
            <AnimatePresence>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-light text-[#ffb59f]"
                >
                  {t("storefront.newsletter.success")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
