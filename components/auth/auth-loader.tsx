"use client";

import { motion } from "motion/react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";

export function AuthLoader({
  message,
  mode = "authenticating",
}: {
  message?: string;
  mode?: "authenticating" | "oauth";
}) {
  const { t } = useI18n();
  const resolvedMessage =
    message ?? t(mode === "oauth" ? "auth.oauth.completing" : "auth.loader.authenticating");

  return (
    <main className="relative grid min-h-[100dvh] place-items-center bg-white px-6">
      <LanguageSwitcher className="absolute right-5 top-5 z-10" />
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.15em] text-[#1c1a18] font-light uppercase">
              Vela Wear
            </h1>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[1px] bg-[#1c1a18]/10 mt-8 relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 w-1/3 bg-[#1c1a18]"
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-numeric text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1a18]/40"
        >
          {resolvedMessage}
        </motion.p>
      </div>
    </main>
  );
}
