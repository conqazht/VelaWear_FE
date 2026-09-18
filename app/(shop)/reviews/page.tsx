import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewsClient } from "./reviews-client";

export const metadata: Metadata = {
  title: "Đánh Giá & Phản Hồi Từ Khách Hàng",
  description:
    "Trải nghiệm thực tế và đánh giá từ khách hàng đã tin dùng các sản phẩm thời trang thiết kế VELA WEAR.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Đánh Giá & Phản Hồi Từ Khách Hàng | VELA WEAR",
    description:
      "Trải nghiệm thực tế và đánh giá từ khách hàng đã tin dùng các sản phẩm thời trang thiết kế VELA WEAR.",
    url: "/reviews",
  },
};

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#f7f4ef]" />}>
      <ReviewsClient />
    </Suspense>
  );
}
