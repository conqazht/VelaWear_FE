"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

import { StatusCodeRain } from "./status-code-rain";

type StatusAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

type AnimatedStatusProps = {
  code: string;
  title: string;
  description: string;
  eyebrow?: string;
  primaryAction: StatusAction;
  secondaryAction?: StatusAction;
  accent?: string;
  reference?: string;
  variant?: "page" | "panel";
  className?: string;
};

function StatusActionLink({ action, primary }: { action: StatusAction; primary: boolean }) {
  const className = cn(
    "inline-flex h-11 min-w-36 items-center justify-center rounded-md border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f4ef]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#11100f]",
    primary
      ? "border-[#f7f4ef] bg-[#f7f4ef] text-[#1c1a18] hover:bg-[#efe7dc]"
      : "border-white/22 bg-white/5 text-[#f7f4ef] hover:bg-white/10",
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

export function AnimatedStatus({
  code,
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryAction,
  accent = "#ffb59f",
  reference,
  variant = "page",
  className,
}: AnimatedStatusProps) {
  const { t } = useI18n();
  const compact = variant === "panel";
  const titleId = `status-${code.replaceAll(/[^a-zA-Z0-9]/g, "-")}-title`;

  return (
    <section
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden bg-[#11100f] text-[#f7f4ef]",
        compact ? "min-h-[430px] rounded-lg" : "min-h-dvh px-5 py-16",
        className,
      )}
      aria-labelledby={titleId}
      role="alert"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${accent}1f 0, transparent 34%), radial-gradient(circle at 15% 15%, ${accent}12 0, transparent 24%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] bg-[size:36px_36px]" />
      <StatusCodeRain code={code} color={accent} compact={compact} hint={t("status.dropHint")} />

      <div
        className={cn(
          "relative z-10 mx-auto text-center",
          compact ? "max-w-lg px-6 py-12" : "max-w-xl",
        )}
      >
        <p className="mb-4 text-[11px] font-medium tracking-[0.3em] text-white/48 uppercase">
          {eyebrow ?? t("status.system")}
        </p>
        <p
          className={cn(
            "font-numeric leading-none font-bold tracking-[-0.07em] text-white",
            compact ? "text-7xl sm:text-8xl" : "text-8xl sm:text-9xl md:text-[10rem]",
          )}
          aria-hidden="true"
        >
          {code}
        </p>
        <div className="mx-auto my-5 h-px w-16" style={{ backgroundColor: accent }} />
        <h1
          id={titleId}
          className={cn("font-serif font-semibold", compact ? "text-2xl" : "text-3xl sm:text-4xl")}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mx-auto mt-3 text-white/58",
            compact ? "max-w-md text-sm leading-6" : "max-w-lg leading-7",
          )}
        >
          {description}
        </p>

        {reference ? (
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] text-white/34 uppercase">
            {t("status.reference", { reference })}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <StatusActionLink action={primaryAction} primary />
          {secondaryAction ? <StatusActionLink action={secondaryAction} primary={false} /> : null}
        </div>
      </div>
    </section>
  );
}

export type { StatusAction };
