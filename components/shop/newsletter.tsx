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
    <section className="relative py-28 md:py-36 bg-[#121110] text-[#f7f4ef] overflow-hidden border-t border-white/5">
      {/* Background Soft Image Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none select-none"
        style={{ backgroundImage: "url('/images/home/editorial/materials-and-draping.webp')" }}
      />
      
      {/* Radial soft lighting vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,87,58,0.12)_0%,rgba(18,17,16,0)_70%)] pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10 text-center flex flex-col items-center">
        
        <ScrollReveal direction="up" className="max-w-2xl flex flex-col items-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#ffb59f] mb-6">
            <Mail className="w-5 h-5" />
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3.5xl md:text-5xl font-light leading-tight tracking-tight text-white mb-4">
            {t("storefront.newsletter.title")}
          </h2>

          {/* Subtitle */}
          <p className="text-[#a89e93] text-sm md:text-base leading-relaxed font-light mb-10 max-w-xl">
            {t("storefront.newsletter.description")}
          </p>

          {/* Form */}
          <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-full p-1.5 flex flex-col sm:flex-row items-center gap-2 focus-within:border-[#b5573a]/50 transition-all duration-300"
          >
            <input
              type="email"
              placeholder={t("storefront.newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-none text-white placeholder-white/30 text-sm px-6 py-3.5 focus:outline-none focus:ring-0"
              required
            />
            
            <motion.button
              type="submit"
              className="w-full sm:w-auto bg-[#f7f4ef] hover:bg-[#efe7dc] text-[#121110] font-semibold text-xs uppercase tracking-[1.5px] px-8 py-4 rounded-full flex items-center justify-center gap-2.5 transition-colors duration-300 cursor-pointer flex-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{subscribed ? t("storefront.newsletter.joined") : t("storefront.newsletter.join")}</span>
              <ArrowRight className="w-4 h-4 text-[#b5573a]" />
            </motion.button>
          </form>

          {/* Feedback message */}
          <div className="h-6 mt-4">
            <AnimatePresence>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[#ffb59f] font-light"
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
