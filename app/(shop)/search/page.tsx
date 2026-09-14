import type { Metadata } from "next";
import { Suspense } from "react";

import { CollectionCatalogLoading, CollectionClient } from "@/components/shop/collection-client";

export const metadata: Metadata = {
  title: "Tìm Kiếm Sản Phẩm",
  description:
    "Tìm kiếm trang phục, áo, quần và phụ kiện thời trang thiết kế cao cấp tại VELA WEAR.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<CollectionCatalogLoading />}>
      <CollectionClient mode="search" />
    </Suspense>
  );
}
