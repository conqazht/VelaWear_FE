"use client";

import { AlertTriangle } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { classifyApiError } from "@/lib/api/errors";

type StorefrontStaleWarningProps = {
  onRetry: () => void;
  resourceLabel: string;
  error?: unknown;
  className?: string;
};

export function StorefrontStaleWarning({
  onRetry,
  resourceLabel,
  error,
  className = "",
}: StorefrontStaleWarningProps) {
  const { t } = useI18n();
  const classification = error === undefined ? null : classifyApiError(error);
  const description = classification?.status === 400
    ? t("errors.api.badRequestDescription", { resource: resourceLabel })
    : t("errors.api.serverDescription", { resource: resourceLabel });

  return (
    <div
      className={`flex flex-col gap-3 border border-[#b5573a]/25 bg-[#efe7dc]/60 px-4 py-3 text-sm text-[#55423d] sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="status"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#b5573a]" aria-hidden="true" />
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{description}</span>
          {classification?.status !== null && classification?.status !== undefined ? (
            <span className="font-mono text-[10px] opacity-65">HTTP {classification.status}</span>
          ) : null}
        </span>
      </span>
      {classification === null || classification.retryable ? (
        <button
          type="button"
          className="shrink-0 self-start text-xs font-semibold uppercase tracking-[0.16em] text-[#b5573a] underline underline-offset-4 sm:self-auto"
          onClick={onRetry}
        >
          {t("errors.common.retry")}
        </button>
      ) : null}
    </div>
  );
}
