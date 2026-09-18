import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { CollectionPage } from "@/components/shop/collection-page";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Thời Trang Thiết Kế",
  description:
    "Khám phá toàn bộ bộ sưu tập trang phục và phụ kiện cao cấp tại VELA WEAR. Thiết kế tối giản, phom dáng chuẩn mực và chất liệu tự nhiên tuyển chọn.",
  alternates: {
    canonical: "/collection",
  },
  openGraph: {
    title: "Bộ Sưu Tập Thời Trang Thiết Kế | VELA WEAR",
    description:
      "Khám phá toàn bộ bộ sưu tập trang phục và phụ kiện cao cấp tại VELA WEAR. Thiết kế tối giản, phom dáng chuẩn mực và chất liệu tự nhiên tuyển chọn.",
    url: "/collection",
  },
};

export default async function Page() {
  "use cache";
  cacheLife("max");

  return <CollectionPage />;
}
