"use client";

import { Suspense } from "react";

import { CollectionCatalogLoading, CollectionClient } from "@/components/shop/collection-client";

export function CollectionPage() {
  return (
    <Suspense fallback={<CollectionCatalogLoading />}>
      <CollectionClient mode="collection" />
    </Suspense>
  );
}
