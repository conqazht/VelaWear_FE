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
    { id: "lightweight-jacket" }
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  return (
    <Suspense fallback={<div className="py-32 text-center select-none"><span className="text-xs uppercase tracking-widest text-[#1c1a18]/50">Loading...</span></div>}>
      <ProductDetailPage slug={slug} />
    </Suspense>
  );
}
