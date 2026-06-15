import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";

import { ProductDetailPage } from "@/components/shop/product-detail-page";
import { getProductById, PRODUCTS } from "@/lib/vela-data";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  "use cache";
  cacheLife("max");

  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}
