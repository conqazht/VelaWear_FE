"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "boneyard-js/react";
import { FashionImage } from "@/components/shop/fashion-image";
import { ProductDetailClient } from "@/components/shop/product-detail-client";
import { RelatedProducts } from "@/components/shop/related-products";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStatus } from "@/components/errors/storefront-status";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import apiClient from "@/lib/api-client";
import { getActiveLocale } from "@/lib/i18n";

export function ProductDetailPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const activeLocale = getActiveLocale();

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setLoadError(null);
      setIsMissing(false);
      setProduct(null);

      try {
        const response = await apiClient.get(`/products/slug/${slug}?locale=${activeLocale}`);
        if (!isMounted) return;

        if (response.data?.data) {
          setProduct(mapBackendProduct(response.data.data, activeLocale));
        } else {
          setIsMissing(true);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, activeLocale, retryKey]);

  return (
    <Skeleton
      name="product-detail"
      loading={isLoading}
      className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]"
      fallback={<ProductDetailLoadingFallback />}
      fixture={<ProductDetailFixture />}
    >
      {product ? (
        <ProductDetailContent product={product} />
      ) : loadError ? (
        <StorefrontApiStatus
          error={loadError}
          onRetry={() => setRetryKey((value) => value + 1)}
          resourceLabel="sản phẩm"
          returnHref="/collection"
          variant="panel"
        />
      ) : (
        <StorefrontStatus
          status={404}
          eyebrow="VELA WEAR / SẢN PHẨM"
          title="Thiết kế này không còn trong bộ sưu tập"
          description={isMissing
            ? "Sản phẩm có thể đã ngừng hiển thị hoặc đường dẫn đã thay đổi. Hãy khám phá những thiết kế đang có tại Vela."
            : "Không tìm thấy thông tin sản phẩm bạn đang tìm kiếm."}
          primaryAction={{ label: "Xem bộ sưu tập", href: "/collection" }}
          secondaryAction={{ label: "Về trang chủ", href: "/" }}
          variant="panel"
        />
      )}
    </Skeleton>
  );
}

function ProductDetailLoadingFallback() {
  return (
    <div className="mx-auto grid w-full gap-10 xl:max-w-[1180px] xl:grid-cols-[631px_360px] xl:justify-center xl:gap-x-6 2xl:max-w-[1220px] 2xl:grid-cols-[631px_380px] 2xl:gap-x-8">
      <div className="flex gap-4 select-none justify-start xl:w-[631px]">
        <div className="flex w-16 flex-none flex-col gap-2 sm:w-20">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse bg-[#efe7dc]" />
          ))}
        </div>

        <div className="relative aspect-[4/5] flex-1 animate-pulse overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efe7dc] xl:h-[668.75px] xl:w-[535px] xl:flex-none" />
      </div>

      <div className="flex h-full flex-col justify-start text-left xl:w-[360px] xl:pt-1 2xl:w-[380px]">
        <div className="mb-2 h-3 w-40 animate-pulse bg-[#efe7dc]" />
        <div className="mb-4 h-12 w-full max-w-[320px] animate-pulse bg-[#efe7dc]" />
        <div className="mb-6 h-8 w-48 animate-pulse bg-[#efe7dc]" />
        <div className="mb-8 h-px w-full bg-[#1c1a18]/10" />
        <div className="mb-8">
          <div className="mb-4 h-3 w-28 animate-pulse bg-[#efe7dc]" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-8 w-8 rounded-full animate-pulse bg-[#efe7dc]" />
            ))}
          </div>
        </div>
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="h-3 w-10 animate-pulse bg-[#efe7dc]" />
            <div className="h-3 w-20 animate-pulse bg-[#efe7dc]" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[50px] animate-pulse bg-[#efe7dc]" />
            ))}
          </div>
        </div>
        <div className="h-[68px] w-full animate-pulse rounded-full bg-[#efe7dc]" />
        <div className="mt-5 h-[60px] w-full animate-pulse rounded-full bg-[#efe7dc]" />
      </div>
    </div>
  );
}

function ProductDetailContent({ product }: { product: Product }) {
  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/collection"
          className="font-medium text-[#1c1a18] underline decoration-[#1c1a18]/20 underline-offset-4 hover:text-[#b85a3c]"
        >
          Collections
        </Link>
        <span>/</span>
        <span className="max-w-[200px] truncate text-[#1c1a18]/40">
          {product.name}
        </span>
      </div>

      <div className="mx-auto w-full xl:max-w-[1180px] 2xl:max-w-[1220px]">
        <ProductDetailClient key={product.id} product={product} />
      </div>

      <RelatedProducts
        categoryId={product.realId}
        categoryCode={product.category}
        currentProductSlug={product.id}
      />

      <section className="grid grid-cols-1 items-center gap-12 border-t border-[#1c1a18]/10 pt-16 md:grid-cols-2 mt-16">
        <div className="md:pr-6 text-left">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
            Craft & Sustainability
          </span>
          <h2 className="mb-6 font-serif text-2xl font-light leading-tight tracking-[0.05em] text-[#1c1a18] md:text-4xl">
            Woven with Intention.
          </h2>
          <p className="mb-4 text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
            Chúng tôi tìm thấy hạt mầm lanh thô mộc từ những nông trại hữu cơ
            tại Pháp. Sợi lanh được đan cài bền bỉ với cotton tự nhiên để tạo
            phom thanh thoát.
          </p>
          <p className="text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
            Lớp lót tơ được khâu tay tinh tế, tối ưu sự thoáng khí và giữ cảm
            giác mềm dịu với làn da suốt cả ngày.
          </p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[#1c1a18]/5 bg-[#efebe4]">
          <FashionImage
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC__H_4LMn9OWi2bzyNpIzC4gWHb9Br_Vet75TFD7uxaguWkP7KSCSFBLXNsS2sP9erYbXRbGKE-izIYXYHiCo87L58iNU80wrzteP0YK5eZku6Lz5B-IOD3xArSTTCzfPAA-ZRZG79PT-WF8sCzihhElmNZoDXZ5TId8uv0DiWfTf6mSGt7kD4f9droH6eKaw_bVH_JBVY_po65000LIfGEqogroLcKbqgTs6UpJpKEmzanAdDuAzI44Si0MQ5dp-RPTuzCoD8ICi6"
            alt="Linen weave close-up detail texture"
          />
        </div>
      </section>
    </>
  );
}

function ProductDetailFixture() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <span>Home</span>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">Collections</span>
        <span>/</span>
        <span>Tailored Linen Blazer</span>
      </div>

      <div className="mx-auto grid w-full gap-10 xl:max-w-[1180px] xl:grid-cols-[631px_360px] xl:justify-center xl:gap-x-6 2xl:max-w-[1220px] 2xl:grid-cols-[631px_380px] 2xl:gap-x-8">
        <div className="flex gap-4 select-none justify-start xl:w-[631px]">
          <div className="flex w-16 flex-none flex-col gap-2 sm:w-20">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="aspect-[4/5] bg-[#efe7dc]" />
            ))}
          </div>

          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efe7dc] xl:h-[668.75px] xl:w-[535px] xl:flex-none" />
        </div>

        <div className="flex h-full flex-col justify-start text-left xl:w-[360px] xl:pt-1 2xl:w-[380px]">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#b85a3c]">Atelier Collection</p>
            <h1 className="font-serif text-4xl font-light tracking-wide text-[#1c1a18]">Tailored Linen Blazer</h1>
          </div>
          <div className="mb-6 mt-6 h-8 w-48 bg-[#efe7dc]" />
          <div className="mb-8 h-px w-full bg-[#1c1a18]/10" />
          <div className="mb-8">
            <div className="mb-4 h-3 w-28 bg-[#efe7dc]" />
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-8 w-8 rounded-full bg-[#efe7dc]" />
              ))}
            </div>
          </div>
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="h-3 w-10 bg-[#efe7dc]" />
              <div className="h-3 w-20 bg-[#efe7dc]" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[50px] bg-[#efe7dc]" />
              ))}
            </div>
          </div>
          <div className="h-[68px] rounded-full bg-[#1c1a18]" />
          <div className="mt-5 h-[60px] rounded-full bg-[#efe7dc]" />
        </div>
      </div>

      <section className="grid grid-cols-1 items-center gap-12 border-t border-[#1c1a18]/10 pt-16 md:grid-cols-2 mt-16">
        <div className="space-y-4">
          <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
            Craft & Sustainability
          </span>
          <h2 className="font-serif text-2xl font-light leading-tight tracking-[0.05em] text-[#1c1a18] md:text-4xl">
            Woven with Intention.
          </h2>
          <p className="text-sm leading-7 text-[#1c1a18]/65">
            Natural fibers and considered construction define the Vela Wear approach.
          </p>
        </div>
        <div className="aspect-[16/10] bg-[#efebe4]" />
      </section>
    </div>
  );
}
