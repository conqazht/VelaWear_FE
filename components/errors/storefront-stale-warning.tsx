"use client";

import { AlertTriangle } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";

type StorefrontStaleWarningProps = {
  onRetry: () => void;
  resourceLabel: string;
  className?: string;
};

export function StorefrontStaleWarning({
  onRetry,
  resourceLabel,
  className = "",
}: StorefrontStaleWarningProps) {
  const { t } = useI18n();

  return (
    <div
      className={`flex flex-col gap-3 border border-[#b5573a]/25 bg-[#efe7dc]/60 px-4 py-3 text-sm text-[#55423d] sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="status"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#964025]" aria-hidden="true" />
        {t("errors.api.serverDescription", { resource: resourceLabel })}
      </span>
      <button
        type="button"
        className="shrink-0 self-start text-xs font-semibold uppercase tracking-[0.16em] text-[#964025] underline underline-offset-4 sm:self-auto"
        onClick={onRetry}
      >
        {t("errors.common.retry")}
      </button>
    </div>
  );
}
