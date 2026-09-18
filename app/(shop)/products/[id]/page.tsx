import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetailPage } from "@/components/shop/product-detail-page";
import { getProductById, mapBackendProduct, type Product } from "@/lib/vela-data";
import { serverApiGet } from "@/lib/api/server";

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

async function getAuthoritativeProduct(slug: string): Promise<Product | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await serverApiGet<any>(`/products/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (data) {
      return mapBackendProduct(data);
    }
  } catch {
    // Fall back to static fixtures when offline or during build
  }

  return getProductById(slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;
  const product = await getAuthoritativeProduct(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velawear.com";

  if (!product) {
    return {
      title: "Sản phẩm",
      description: "Chi tiết sản phẩm thời trang cao cấp VELA WEAR.",
    };
  }

  const title = product.seoTitle || `${product.name} | VELA WEAR`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Sản phẩm thời trang cao cấp ${product.name} tại VELA WEAR.`;

  const imageUrl = product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`;

  return {
    title: product.name,
    description,
    keywords: product.seoKeywords ? product.seoKeywords.split(",") : undefined,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${slug}`,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const product = await getAuthoritativeProduct(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velawear.com";

  const jsonLdProduct = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`,
        description: product.description,
        brand: {
          "@type": "Brand",
          name: "VELA WEAR",
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/products/${slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLdProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
      )}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailPage slug={slug} />
      </Suspense>
    </>
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
