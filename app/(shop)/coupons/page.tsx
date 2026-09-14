import type { Metadata } from "next";
import { Suspense } from "react";
import { CouponsClient } from "./coupons-client";

export const metadata: Metadata = {
  title: "Mã Ưu Đãi & Khuyến Mãi Đặc Quyền",
  description:
    "Danh sách mã giảm giá, voucher khuyến mãi độc quyền dành riêng cho khách hàng của VELA WEAR.",
  alternates: {
    canonical: "/coupons",
  },
  openGraph: {
    title: "Mã Ưu Đãi & Khuyến Mãi Đặc Quyền | VELA WEAR",
    description:
      "Danh sách mã giảm giá, voucher khuyến mãi độc quyền dành riêng cho khách hàng của VELA WEAR.",
    url: "/coupons",
  },
};

export default function CouponsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ef]" />}>
      <CouponsClient />
    </Suspense>
  );
}
