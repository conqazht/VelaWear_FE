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
    <AuthShell className="h-[100dvh] w-[100vw] overflow-hidden p-4 bg-[#f7f4ef]">
      <div className="grid h-full w-full gap-4 lg:grid-cols-[1fr_minmax(0,560px)] justify-center">
        <AuthMotionScene
          focus={focus}
          passwordVisible={passwordVisible}
          status={status}
          mode={mode}
        />

        <section className="relative flex h-full w-full max-w-[560px] mx-auto items-center justify-center overflow-y-auto rounded-[24px] border border-[#e4dacf] bg-[#f7f4ef] px-4 py-8 shadow-[0_24px_80px_rgba(69,43,28,0.08)] md:px-8 isolate">
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
            className={cn(
              "w-full max-w-[360px] z-10 relative",
              panelClassName
            )}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 text-center">
              <Link
                href="/"
                aria-label={t("auth.common.homeAria")}
                className="inline-block transition-opacity hover:opacity-90"
              >
                <BrandMark className="mx-auto" />
              </Link>
              <h1 className="mt-4 font-serif text-[32px] font-normal leading-[1.16] text-[#1c1a18] md:text-[36px]">
                {title}
              </h1>
              <p className="mx-auto mt-3 max-w-[320px] text-sm leading-[1.55] text-[#55423d]">
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
