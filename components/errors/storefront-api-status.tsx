"use client";

import { useEffect } from "react";

import { getApiErrorStatus } from "@/lib/api/errors";
import { createSignInHref } from "@/lib/auth/post-auth-redirect";

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
  variant?: "page" | "panel";
  className?: string;
};

type StatusContent = {
  title: string;
  description: string;
  primaryAction: StorefrontStatusAction;
  secondaryAction?: StorefrontStatusAction;
};

export function StorefrontApiStatus({
  error,
  onRetry,
  resourceLabel = "nội dung này",
  returnHref = "/",
  returnLabel = "Tiếp tục mua sắm",
  variant = "panel",
  className,
}: StorefrontApiStatusProps) {
  const status = getApiErrorStatus(error) ?? 500;

  useEffect(() => {
    if (status !== 401) return;

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(createSignInHref(currentPath));
  }, [status]);

  // 401 is a navigation state, not a dedicated artwork. The effect above hands it
  // to sign-in while preserving a validated internal return path.
  if (status === 401) return null;

  const returnAction: StorefrontStatusAction = {
    label: returnLabel,
    href: returnHref,
  };
  const retryAction: StorefrontStatusAction | undefined = onRetry
    ? { label: "Thử lại", onClick: onRetry }
    : undefined;

  let content: StatusContent;

  if (status === 403) {
    content = {
      title: "Nội dung này chưa dành cho bạn",
      description: `Tài khoản hiện tại không có quyền xem ${resourceLabel}. Bạn có thể quay lại cửa hàng hoặc đăng nhập bằng tài khoản phù hợp.`,
      primaryAction: returnAction,
    };
  } else if (status === 404) {
    content = {
      title: "Không tìm thấy nội dung",
      description: `Chúng tôi không tìm thấy ${resourceLabel}. Nội dung có thể đã được chuyển, đổi tên hoặc không còn hiển thị.`,
      primaryAction: returnAction,
    };
  } else if (status >= 500) {
    content = {
      title: "Có một nhịp ngắt quãng",
      description: `Kết nối đến ${resourceLabel} đang bị gián đoạn. Vela Wear đã ghi nhận và bạn có thể thử lại sau ít phút.`,
      primaryAction: retryAction ?? returnAction,
      secondaryAction: retryAction ? returnAction : undefined,
    };
  } else {
    content = {
      title: "Yêu cầu chưa thể hoàn tất",
      description: `Chúng tôi chưa thể tải ${resourceLabel} ở thời điểm này. Vui lòng kiểm tra lại thông tin và thử thêm một lần nữa.`,
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
