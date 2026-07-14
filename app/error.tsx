"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <StorefrontStatus
      status={500}
      title="Trải nghiệm cần một nhịp nghỉ"
      description="Một lỗi ngoài dự kiến đã làm gián đoạn trang này. Hãy thử tải lại hoặc quay về cửa hàng trong lúc chúng tôi khôi phục kết nối."
      primaryAction={{ label: "Thử lại", onClick: unstable_retry }}
      secondaryAction={{ label: "Về trang chủ", href: "/" }}
      reference={error.digest}
    />
  );
}
