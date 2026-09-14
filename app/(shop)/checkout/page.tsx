import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { CheckoutPageClient } from "@/components/shop/checkout-page-client";

export const metadata: Metadata = {
  title: "Thanh Toán Đơn Hàng",
  description: "Hoàn tất thanh toán an toàn và bảo mật cho đơn hàng VELA WEAR của bạn.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  "use cache";
  cacheLife("max");

  return <CheckoutPageClient />;
}
