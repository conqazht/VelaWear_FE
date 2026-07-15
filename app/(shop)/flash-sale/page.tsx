import type { Metadata } from "next";

import { SaleLanding } from "@/components/shop/sale-landing";

export const metadata: Metadata = {
  title: "Flash Sale | VELA WEAR",
  description: "Flash Sale giới hạn thời gian và số lượng tại VELA WEAR.",
};

export default function FlashSalePage() {
  return <SaleLanding type="FLASH" />;
}
