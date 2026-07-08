import { Suspense } from "react";

import { FavoritesPageClient } from "@/components/shop/favorites-page-client";

export default function FavoritesPage() {
  return (
    <Suspense fallback={<FavoritesPageFallback />}>
      <FavoritesPageClient />
    </Suspense>
  );
}

function FavoritesPageFallback() {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]">
      <div className="h-8 w-56 animate-pulse bg-[#efe7dc]" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] animate-pulse bg-[#efe7dc]" />
            <div className="h-4 w-3/4 animate-pulse bg-[#efe7dc]" />
            <div className="h-4 w-1/3 animate-pulse bg-[#efe7dc]" />
          </div>
        ))}
      </div>
    </div>
  );
}
