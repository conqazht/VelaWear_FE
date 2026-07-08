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
    { id: "merino-wool-coat" }
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  return (
    <Suspense fallback={null}>
      <ProductDetailPage slug={slug} />
    </Suspense>
  );
}
