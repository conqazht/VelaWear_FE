import { Suspense } from "react";
import type { Metadata } from "next";

import { PaymentReturnClient } from "@/components/shop/payment/payment-return-client";

export const metadata: Metadata = {
  title: "Kết quả thanh toán | Vela Wear",
  description: "Trạng thái và kết quả giao dịch thanh toán đơn hàng tại Vela Wear.",
};

export default function PaymentGeneralReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-12rem)] w-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-[#b5573a] border-t-transparent" />
        </div>
      }
    >
      <PaymentReturnClient />
    </Suspense>
  );
}
