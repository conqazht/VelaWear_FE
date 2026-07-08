import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { CartPageClient } from "@/components/shop/cart-page-client";

export default async function Page() {
  "use cache";
  cacheLife("max");

  return (
    <Suspense fallback={<CartPageFallback />}>
      <CartPageClient />
    </Suspense>
  );
}

function CartPageFallback() {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      <div className="h-8 w-48 animate-pulse bg-[#efe7dc]" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="h-36 animate-pulse bg-[#efe7dc]" />
          <div className="h-36 animate-pulse bg-[#efe7dc]" />
        </div>
        <div className="h-80 animate-pulse bg-[#efe7dc]" />
      </div>
    </div>
  );
}
