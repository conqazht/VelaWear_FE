import { Suspense } from "react";

import { CollectionCatalogLoading, CollectionClient } from "@/components/shop/collection-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<CollectionCatalogLoading />}>
      <CollectionClient mode="search" />
    </Suspense>
  );
}
