import type { Metadata } from "next";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export const metadata: Metadata = {
  title: "403 — Access denied | Vela Wear",
};

export default function ForbiddenPage() {
  return (
    <StorefrontStatus
      status={403}
      title="Khu vực này chưa dành cho bạn"
      description="Tài khoản hiện tại đã đăng nhập nhưng chưa có quyền mở nội dung này. Hãy quay lại cửa hàng hoặc chọn một bộ sưu tập khác."
      primaryAction={{ label: "Về trang chủ", href: "/" }}
      secondaryAction={{ label: "Xem bộ sưu tập", href: "/collection" }}
    />
  );
}
