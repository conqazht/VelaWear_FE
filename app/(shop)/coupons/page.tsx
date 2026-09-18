import type { Metadata } from "next";
import { Suspense } from "react";
import { CouponsClient, CouponsPageLoading } from "./coupons-client";

export const metadata: Metadata = {
  title: "Mã Giảm Giá | Voucher Ưu Đãi Toàn Sàn - Vela Wear",
  description:
    "Khám phá các mã giảm giá và voucher khuyến mãi độc quyền toàn sàn tại Vela Wear. Đăng nhập để nhận thêm ưu đãi cá nhân và theo dõi lịch sử tiết kiệm.",
  alternates: {
    canonical: "/coupons",
  },
  openGraph: {
    title: "Mã Giảm Giá & Ưu Đãi Mua Sắm - Vela Wear",
    description: "Khám phá các mã giảm giá và voucher khuyến mãi độc quyền toàn sàn tại Vela Wear.",
    url: "/coupons",
    type: "website",
  },
};

export default function CouponsPage() {
  return (
    <Suspense fallback={<CouponsPageLoading />}>
      <CouponsClient />
    </Suspense>
  );
}
