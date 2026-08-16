"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import {
  AuthMotionScene,
  type AuthSceneFocus,
  type AuthSceneStatus,
} from "@/components/auth/auth-motion-scene";
import { AuthShell } from "@/components/auth/auth-shell";
import { useI18n } from "@/components/providers/i18n-provider";
import { BrandMark } from "@/components/shop/brand-mark";
import { cn } from "@/lib/utils";

interface AnimatedAuthShellProps {
  children: ReactNode;
  footer: ReactNode;
  focus: AuthSceneFocus;
  passwordVisible: boolean;
  status: AuthSceneStatus;
  mode: "sign-in" | "register" | "forgot-password";
  title: string;
  description: string;
  panelClassName?: string;
}

export function AnimatedAuthShell({
  children,
  footer,
  focus,
  passwordVisible,
  status,
  mode,
  title,
  description,
  panelClassName,
}: AnimatedAuthShellProps) {
  const { t } = useI18n();

  return (
    <AuthShell className="h-[100dvh] w-[100vw] overflow-hidden bg-[#f7f4ef] p-4">
      <div className="grid h-full w-full justify-center gap-4 lg:grid-cols-[1fr_minmax(0,560px)]">
        <AuthMotionScene
          focus={focus}
          passwordVisible={passwordVisible}
          status={status}
          mode={mode}
        />

        <section className="relative isolate mx-auto flex h-full w-full max-w-[560px] [scrollbar-width:none] items-center justify-center overflow-y-auto rounded-[24px] border border-[#e4dacf] bg-[#f7f4ef] px-4 py-2 shadow-[0_24px_80px_rgba(69,43,28,0.08)] sm:py-4 md:px-8 [&::-webkit-scrollbar]:hidden">
          {/* Inner background image container with clean clipping */}
          <div
            className="absolute inset-0 z-0 overflow-hidden rounded-[23px]"
            style={{
              backgroundImage: "url('/auth/bg-login.webp')",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-[#f7f4ef]/85" />
          </div>

          <motion.div
            className={cn("relative z-10 my-auto w-full max-w-[360px]", panelClassName)}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-3 text-center sm:mb-4">
              <Link
                href="/"
                aria-label={t("auth.common.homeAria")}
                className="inline-block transition-opacity hover:opacity-90"
              >
                <BrandMark className="mx-auto" />
              </Link>
              <h1 className="mt-3 font-serif text-[28px] leading-[1.16] font-normal text-[#1c1a18] sm:text-[32px]">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-[320px] text-xs leading-[1.5] text-[#55423d] sm:text-sm">
                {description}
              </p>
            </div>

            {children}
            {footer}
          </motion.div>
        </section>
      </div>
    </AuthShell>
  );
}
