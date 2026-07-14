"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-[104px] md:pt-[120px] lg:px-10">
      <StorefrontStatus
        status={500}
        title="Gian hàng cần một nhịp nghỉ"
        description="Một lỗi ngoài dự kiến đã làm gián đoạn nội dung này. Hãy thử tải lại, hoặc tiếp tục khám phá các thiết kế khác."
        primaryAction={{ label: "Thử lại", onClick: unstable_retry }}
        secondaryAction={{ label: "Xem bộ sưu tập", href: "/collection" }}
        reference={error.digest}
        variant="panel"
      />
    </div>
  );
}
