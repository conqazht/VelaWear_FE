"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { classifyApiError } from "@/lib/api/errors";
import { createSignInHref } from "@/lib/auth/post-auth-redirect";
import type { TranslationKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

import {
  StorefrontStatus,
  type StorefrontStatusAction,
} from "./storefront-status";

type StorefrontApiStatusProps = {
  error: unknown;
  onRetry?: () => void;
  resourceLabel?: string;
  returnHref?: string;
  returnLabel?: string;
  recoveryAction?: StorefrontApiRecoveryAction;
  variant?: "page" | "route" | "panel";
  className?: string;
};

type StorefrontApiRecoveryAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

type StatusContent = {
  title: string;
  description: string;
  primaryAction: StorefrontStatusAction;
  secondaryAction?: StorefrontStatusAction;
};

const RESOURCE_KEYS: Record<string, TranslationKey> = {
  "kết quả tìm kiếm": "errors.resource.searchResults",
  "mã giảm giá": "errors.resource.coupons",
  "bộ sưu tập": "errors.resource.collection",
  "đánh giá của bạn": "errors.resource.reviews",
  "địa chỉ giao hàng": "errors.resource.addresses",
  "lịch sử đơn hàng": "errors.resource.orders",
  "danh sách yêu thích": "errors.resource.favorites",
  "đơn hàng": "errors.resource.order",
  "lịch sử trạng thái đơn hàng": "errors.resource.orderStatus",
  "sản phẩm": "errors.resource.product",
};

const RETURN_LABEL_KEYS: Record<string, TranslationKey> = {
  "Tiếp tục mua sắm": "errors.common.continueShopping",
  "Về lịch sử đơn hàng": "errors.common.orderHistory",
};

function BadRequestNotice({
  title,
  description,
  action,
  variant,
  className,
}: {
  title: string;
  description: string;
  action: StorefrontApiRecoveryAction;
  variant: "page" | "route" | "panel";
  className?: string;
}) {
  const titleId = "storefront-status-400-title";
  const actionClassName =
    "inline-flex min-h-11 items-center justify-center rounded-sm border border-[#1c1a18] bg-[#1c1a18] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#f7f4ef] transition-colors hover:border-[#b5573a] hover:bg-[#b5573a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5573a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ef]";

  return (
    <section
      className={cn(
        "relative isolate flex w-full items-center overflow-hidden bg-[#f7f4ef] px-5 py-10 text-[#1c1a18] sm:px-8",
        variant === "panel"
          ? "min-h-64 rounded-sm border border-[#e3dccf]"
          : variant === "route"
            ? "mt-[72px] min-h-[360px] lg:px-12"
            : "min-h-[50dvh] lg:px-12",
        className,
      )}
      aria-labelledby={titleId}
      role="alert"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(181,87,58,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(181,87,58,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="relative z-10 mx-auto w-full max-w-3xl border-l-2 border-[#b5573a]/55 pl-5 sm:pl-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#964025]">
          Vela Wear / HTTP 400
        </p>
        <h1
          id={titleId}
          className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#55423d]/80 sm:text-base sm:leading-7">
          {description}
        </p>
        <div className="mt-7">
          {action.href ? (
            <Link href={action.href} className={actionClassName}>
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className={actionClassName}>
              {action.label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function StorefrontApiStatus({
  error,
  onRetry,
  resourceLabel,
  returnHref = "/",
  returnLabel,
  recoveryAction,
  variant = "panel",
  className,
}: StorefrontApiStatusProps) {
  const { t } = useI18n();
  const classification = classifyApiError(error);
  const status = classification.status ?? 500;
  const localizedResource = resourceLabel
    ? RESOURCE_KEYS[resourceLabel]
      ? t(RESOURCE_KEYS[resourceLabel])
      : resourceLabel
    : t("errors.resource.default");
  const localizedReturnLabel = returnLabel
    ? RETURN_LABEL_KEYS[returnLabel]
      ? t(RETURN_LABEL_KEYS[returnLabel])
      : returnLabel
    : t("errors.common.continueShopping");

  useEffect(() => {
    if (status !== 401) return;

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(createSignInHref(currentPath));
  }, [status]);

  if (classification.kind === "cancelled") return null;

  // 401 is a navigation state, not a dedicated artwork. The effect above hands it
  // to sign-in while preserving a validated internal return path.
  if (status === 401) return null;

  const returnAction: StorefrontApiRecoveryAction = {
    label: localizedReturnLabel,
    href: returnHref,
  };
  const retryAction: StorefrontStatusAction | undefined = classification.retryable && onRetry
    ? { label: t("errors.common.retry"), onClick: onRetry }
    : undefined;

  if (status === 400) {
    return (
      <BadRequestNotice
        title={t("errors.api.badRequestTitle")}
        description={t("errors.api.badRequestDescription", { resource: localizedResource })}
        action={recoveryAction ?? returnAction}
        variant={variant}
        className={className}
      />
    );
  }

  let content: StatusContent;

  if (status === 403) {
    content = {
      title: t("errors.api.forbiddenTitle"),
      description: t("errors.api.forbiddenDescription", { resource: localizedResource }),
      primaryAction: returnAction,
    };
  } else if (status === 404) {
    content = {
      title: t("errors.api.notFoundTitle"),
      description: t("errors.api.notFoundDescription", { resource: localizedResource }),
      primaryAction: returnAction,
    };
  } else if (status >= 500) {
    content = {
      title: t("errors.api.serverTitle"),
      description: t("errors.api.serverDescription", { resource: localizedResource }),
      primaryAction: retryAction ?? returnAction,
      secondaryAction: retryAction ? returnAction : undefined,
    };
  } else {
    content = {
      title: t("errors.api.genericTitle"),
      description: t("errors.api.genericDescription", { resource: localizedResource }),
      primaryAction: retryAction ?? returnAction,
      secondaryAction: retryAction ? returnAction : undefined,
    };
  }

  return (
    <StorefrontStatus
      status={status}
      title={content.title}
      description={content.description}
      primaryAction={content.primaryAction}
      secondaryAction={content.secondaryAction}
      variant={variant}
      className={className}
    />
  );
}

export type { StorefrontApiStatusProps };
