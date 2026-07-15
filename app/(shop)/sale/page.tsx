import type { Metadata } from "next";

import { SaleLanding } from "@/components/shop/sale-landing";

export const metadata: Metadata = {
  title: "Sale | VELA WEAR",
  description: "Các chương trình Standard Sale đang diễn ra tại VELA WEAR.",
};

export default function SalePage() {
  return <SaleLanding type="STANDARD" />;
}
