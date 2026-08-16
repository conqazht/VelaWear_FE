"use client";

import { motion } from "motion/react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Skeleton
        className="absolute top-5 right-5 z-10 size-8 rounded-full bg-[#1c1a18]/10"
        aria-hidden="true"
      />
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-3xl font-light tracking-[0.15em] text-[#1c1a18] uppercase md:text-4xl">
              Vela Wear
            </h1>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8 h-[1px] w-16 overflow-hidden bg-[#1c1a18]/10"
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
          className="font-numeric text-[10px] font-bold tracking-[0.2em] text-[#1c1a18]/40 uppercase"
        >
          {resolvedMessage}
        </motion.p>
      </div>
    </main>
  );
}
