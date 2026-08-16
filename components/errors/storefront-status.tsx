"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import type { TranslationKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

import { StatusCodeRain } from "./status-code-rain";

type StorefrontStatusActionLabel =
  | { label: string; labelKey?: never }
  | { label?: never; labelKey: TranslationKey };

type StorefrontStatusAction = StorefrontStatusActionLabel &
  (
    | { href: string; onClick?: never }
    | { onClick: () => void; href?: never }
  );

type ResolvedStorefrontStatusAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

type StorefrontStatusCopy = {
  atelier: string;
  editorial: string;
  eyebrow: string;
  rainHint: string;
  referenceText?: string;
  statusNumberText?: string;
};

type StorefrontStatusProps = {
  status: number;
  title?: string;
  titleKey?: TranslationKey;
  description?: string;
  descriptionKey?: TranslationKey;
  primaryAction: StorefrontStatusAction;
  eyebrow?: string;
  secondaryAction?: StorefrontStatusAction;
  reference?: string;
  variant?: "page" | "route" | "panel";
  className?: string;
  headerAccessory?: ReactNode;
  standaloneCopy?: StorefrontStatusCopy;
};

function StorefrontStatusActionLink({
  action,
  primary,
}: {
  action: ResolvedStorefrontStatusAction;
  primary: boolean;
}) {
  const className = cn(
    "relative z-20 inline-flex min-h-11 min-w-40 items-center justify-center rounded-sm border px-6 text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5573a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ef]",
    primary
      ? "border-[#1c1a18] bg-[#1c1a18] text-[#f7f4ef] hover:border-[#b5573a] hover:bg-[#b5573a]"
      : "border-[#b5573a]/55 bg-transparent text-[#b5573a] hover:border-[#b5573a] hover:bg-[#efe7dc]",
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

function resolveLiteralAction(action: StorefrontStatusAction): ResolvedStorefrontStatusAction {
  return { ...action, label: action.label ?? action.labelKey } as ResolvedStorefrontStatusAction;
}

function LocalizedStorefrontStatus(props: StorefrontStatusProps) {
  const { t } = useI18n();
  const { status, reference } = props;
  const resolveAction = (action: StorefrontStatusAction): ResolvedStorefrontStatusAction => ({
    ...action,
    label: action.label ?? t(action.labelKey),
  }) as ResolvedStorefrontStatusAction;

  return (
    <StorefrontStatusView
      {...props}
      title={props.title ?? (props.titleKey ? t(props.titleKey) : String(status))}
      description={props.description ?? (props.descriptionKey ? t(props.descriptionKey) : "")}
      primaryAction={resolveAction(props.primaryAction)}
      secondaryAction={props.secondaryAction ? resolveAction(props.secondaryAction) : undefined}
      headerAccessory={props.headerAccessory ?? <LanguageSwitcher showIcon={false} />}
      copy={{
        atelier: t("errors.common.atelier"),
        editorial: t("errors.common.editorial"),
        eyebrow: props.eyebrow ?? t("errors.common.eyebrow", { status }),
        rainHint: t("errors.common.rainHint"),
        referenceText: reference
          ? t("errors.common.reference", { reference })
          : undefined,
        statusNumberText: t("errors.common.number", { number: status }),
      }}
    />
  );
}

export function StorefrontStatus(props: StorefrontStatusProps) {
  if (!props.standaloneCopy) return <LocalizedStorefrontStatus {...props} />;

  return (
    <StorefrontStatusView
      {...props}
      title={props.title ?? String(props.status)}
      description={props.description ?? ""}
      primaryAction={resolveLiteralAction(props.primaryAction)}
      secondaryAction={props.secondaryAction ? resolveLiteralAction(props.secondaryAction) : undefined}
      copy={props.standaloneCopy}
    />
  );
}

type StorefrontStatusViewProps = Omit<
  StorefrontStatusProps,
  "descriptionKey" | "standaloneCopy" | "titleKey" | "primaryAction" | "secondaryAction"
> & {
  title: string;
  description: string;
  primaryAction: ResolvedStorefrontStatusAction;
  secondaryAction?: ResolvedStorefrontStatusAction;
  copy: StorefrontStatusCopy;
};

function StorefrontStatusView({
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
  reference,
  variant = "page",
  className,
  headerAccessory,
  copy,
}: StorefrontStatusViewProps) {
  const compact = variant === "panel";
  const route = variant === "route";
  const code = String(status);
  const titleId = `storefront-status-${status}-title`;

  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden bg-[#f7f4ef] text-[#1c1a18]",
        compact
          ? "min-h-[430px] rounded-sm border border-[#e3dccf] px-5 py-10 sm:px-8"
          : route
            ? "mt-[72px] min-h-[calc(100dvh-72px)] px-5 py-10 sm:px-8 lg:px-12"
            : "min-h-dvh px-5 py-8 sm:px-8 sm:py-10 lg:px-12",
        className,
      )}
      aria-labelledby={titleId}
      role="alert"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(181,87,58,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(181,87,58,0.055)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-[#b5573a]/18 sm:-right-20 sm:h-[34rem] sm:w-[34rem]" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-[20rem] w-[20rem] rounded-full bg-[#efe7dc]/70 sm:h-[25rem] sm:w-[25rem]" />
      <StatusCodeRain
        code={code}
        color="#b5573a"
        compact={compact}
        hint={copy.rainHint}
        hintTone="dark"
      />

      {!compact && !route ? (
        <div className="relative z-10 flex items-center justify-between border-b border-[#e3dccf] pb-5">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1c1a18] transition-colors hover:text-[#b5573a]"
          >
            Vela Wear
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.24em] text-[#55423d]/65 sm:inline">
              {copy.atelier}
            </span>
            {headerAccessory}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto grid w-full flex-1 items-center",
          compact
            ? "max-w-4xl gap-5 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:gap-10"
            : "max-w-6xl gap-8 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16 lg:py-16",
        )}
      >
        <div className={cn("relative flex items-center", compact ? "justify-center sm:justify-start" : "justify-center md:justify-start")}>
          <div
            className={cn(
              "pointer-events-none absolute rounded-full border border-[#b5573a]/25",
              compact ? "h-36 w-36 sm:h-44 sm:w-44" : "h-52 w-52 sm:h-64 sm:w-64 lg:h-80 lg:w-80",
            )}
          />
          <p
            className={cn(
              "relative font-numeric font-semibold leading-none tracking-[-0.09em] text-[#b5573a]",
              compact ? "text-7xl sm:text-8xl lg:text-9xl" : "text-[7rem] sm:text-[9rem] lg:text-[12rem]",
            )}
            aria-hidden="true"
          >
            {code}
          </p>
        </div>

        <div className={cn(compact ? "text-center sm:text-left" : "text-center md:text-left")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b5573a]">{copy.eyebrow}</p>
          <div className={cn("bg-[#b5573a]", compact ? "mx-auto my-4 h-px w-12 sm:mx-0" : "mx-auto my-5 h-px w-16 md:mx-0")} />
          <h1
            id={titleId}
            className={cn(
              "font-serif font-medium leading-[1.12] tracking-[-0.025em] text-[#1c1a18]",
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-4 text-[#55423d]/80",
              compact ? "mx-auto max-w-lg text-sm leading-6 sm:mx-0" : "mx-auto max-w-xl leading-7 md:mx-0",
            )}
          >
            {description}
          </p>

          {reference ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#55423d]/50">
              {copy.referenceText}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-7 flex flex-col items-center gap-3 sm:flex-row",
              compact ? "sm:justify-start" : "md:justify-start",
            )}
          >
            <StorefrontStatusActionLink action={primaryAction} primary />
            {secondaryAction ? <StorefrontStatusActionLink action={secondaryAction} primary={false} /> : null}
          </div>
        </div>
      </div>

      {!compact && !route ? (
        <div className="relative z-10 flex items-center justify-between border-t border-[#e3dccf] pt-5 text-[10px] uppercase tracking-[0.2em] text-[#55423d]/55">
          <span>{copy.editorial}</span>
          <span aria-hidden="true">{copy.statusNumberText ?? `# ${code}`}</span>
        </div>
      ) : null}
    </section>
  );
}

export type { StorefrontStatusAction, StorefrontStatusCopy, StorefrontStatusProps };
