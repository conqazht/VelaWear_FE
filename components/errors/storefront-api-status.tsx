"use client";

import { useEffect } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { classifyApiError } from "@/lib/api/errors";
import { createSignInHref } from "@/lib/auth/post-auth-redirect";
import type { TranslationKey } from "@/lib/i18n/messages";

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
  variant?: "page" | "route" | "panel";
  className?: string;
};

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

export function StorefrontApiStatus({
  error,
  onRetry,
  resourceLabel,
  returnHref = "/",
  returnLabel,
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

  const returnAction: StorefrontStatusAction = {
    label: localizedReturnLabel,
    href: returnHref,
  };
  const retryAction: StorefrontStatusAction | undefined = onRetry
    ? { label: t("errors.common.retry"), onClick: onRetry }
    : undefined;

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
