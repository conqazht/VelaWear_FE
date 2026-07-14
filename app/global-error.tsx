"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <title>500 — Vela Wear</title>
        <StorefrontStatus
          status={500}
          title="Vela Wear cần một chút thời gian"
          description="Một lỗi nghiêm trọng đã làm gián đoạn ứng dụng. Hãy thử mở lại trải nghiệm hoặc quay về cửa hàng."
          primaryAction={{ label: "Thử lại", onClick: unstable_retry }}
          secondaryAction={{ label: "Về trang chủ", href: "/" }}
          reference={error.digest}
        />
      </body>
    </html>
  );
}
