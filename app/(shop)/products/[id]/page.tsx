import { Suspense } from "react";
import { ProductDetailPage } from "@/components/shop/product-detail-page";

export function generateStaticParams() {
  return [
    { id: "linen-blazer" },
    { id: "silk-blouse" },
    { id: "wide-trousers" },
    { id: "leather-tote" },
    { id: "signature-hemp-tee" },
    { id: "artisan-linen-overshirt" },
    { id: "chunky-wool-knit" },
    { id: "oversized-linen-shirt" },
    { id: "relaxed-trousers" },
    { id: "lightweight-jacket" },
    { id: "classic-linen-shirt" },
    { id: "pleated-wool-trousers" },
    { id: "the-heritage-tote" },
    { id: "merino-wool-coat" },
  ];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailPage slug={slug} />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-md bg-[#efe7dc]" />
        <div className="space-y-4 pt-4">
          <div className="h-8 w-3/4 animate-pulse bg-[#e5dccf]" />
          <div className="h-6 w-1/4 animate-pulse bg-[#e5dccf]" />
          <div className="mt-8 h-28 w-full animate-pulse bg-[#efe7dc]" />
        </div>
      </div>
    </div>
  );
}
