import type { Metadata } from "next";
import { Suspense } from "react";

import { SizeGuideClient } from "./_components/size-guide-client";

export const metadata: Metadata = {
  title: "Hướng dẫn chọn cỡ | Vela Wear",
  description: "Bảng số đo cơ thể, quy đổi size quốc tế, giày và phụ kiện của Vela Wear.",
};

export default function SizeGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-160px)] pt-[104px] md:pt-[120px]" aria-busy="true" />
      }
    >
      <SizeGuideClient />
    </Suspense>
  );
}
