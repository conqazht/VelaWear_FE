"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FashionImage } from "@/components/shop/fashion-image";
import { ProductDetailClient } from "@/components/shop/product-detail-client";
import { RelatedProducts } from "@/components/shop/related-products";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStatus } from "@/components/errors/storefront-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import apiClient from "@/lib/api-client";
import { classifyApiError } from "@/lib/api/errors";

export function ProductDetailPage({ slug }: { slug: string }) {
  const { locale: activeLocale, t } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const productRef = useRef<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        const response = await apiClient.get(`/products/slug/${slug}?locale=${activeLocale}`);
        if (!isMounted) return;

        if (response.data?.data) {
          const nextProduct = mapBackendProduct(response.data.data, activeLocale);
          productRef.current = nextProduct;
          setProduct(nextProduct);
          setLoadError(null);
          setIsMissing(false);
        } else if (!productRef.current) {
          setIsMissing(true);
          setLoadError(null);
        }
      } catch (err) {
        if (isMounted && classifyApiError(err).kind !== "cancelled") {
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

  if (isLoading && !product) {
    return (
      <div
        className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]"
        aria-busy="true"
      >
        <span role="status" className="sr-only">
          {t("common.loading")}
        </span>
        <ProductDetailLoadingFallback />
      </div>
    );
  }

  if (!product && loadError) {
    return (
      <StorefrontApiStatus
        error={loadError}
        onRetry={() => setRetryKey((value) => value + 1)}
        resourceLabel={t("storefront.product.resource")}
        returnHref="/collection"
        variant="route"
      />
    );
  }

  if (!product) {
    return (
      <StorefrontStatus
        status={404}
        eyebrow={t("storefront.product.missingEyebrow")}
        title={t("storefront.product.missingTitle")}
        description={isMissing
          ? t("storefront.product.missingDescription")
          : t("storefront.product.missingGeneric")}
        primaryAction={{ label: t("storefront.product.viewCollection"), href: "/collection" }}
        secondaryAction={{ label: t("storefront.product.backHome"), href: "/" }}
        variant="route"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pb-12 pt-[104px] md:px-16 md:pt-[120px]">
      {loadError ? (
        <StorefrontStaleWarning
          className="mb-6"
          resourceLabel={t("storefront.product.resource")}
          onRetry={() => setRetryKey((value) => value + 1)}
          error={loadError}
        />
      ) : null}
      <ProductDetailContent product={product} />
    </div>
  );
}
function ProductDetailLoadingFallback() {
  return (
    <div aria-hidden="true">
      <div className="mb-10 flex items-center gap-2">
        <Skeleton className="h-2.5 w-12 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-2 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-20 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-2 rounded-none bg-[#efe7dc]" />
        <Skeleton className="h-2.5 w-28 rounded-none bg-[#efe7dc]" />
      </div>

      <div className="mb-24 grid grid-cols-1 items-start gap-10 xl:grid-cols-[631px_360px] xl:justify-center xl:gap-x-6 2xl:grid-cols-[631px_380px] 2xl:gap-x-8">
        <div className="flex justify-start gap-4 select-none xl:w-[631px]">
          <div className="flex w-16 flex-none flex-col gap-2 sm:w-20">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-[4/5] rounded-none bg-[#efe7dc]"
              />
            ))}
          </div>

          <Skeleton className="aspect-[4/5] flex-1 rounded-none border border-[#1c1a18]/5 bg-[#efe7dc] xl:h-[668.75px] xl:w-[535px] xl:flex-none" />
        </div>

        <div className="flex h-full flex-col justify-start text-left xl:w-[360px] xl:pt-1 2xl:w-[380px]">
          <Skeleton className="mb-2 h-3 w-40 rounded-none bg-[#efe7dc]" />
          <Skeleton className="mb-4 h-10 w-full max-w-[320px] rounded-none bg-[#efe7dc]" />
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-8 w-32 rounded-none bg-[#efe7dc]" />
            <Skeleton className="h-4 w-20 rounded-none bg-[#efe7dc]" />
          </div>
          <Skeleton className="mb-8 h-px w-full rounded-none bg-[#1c1a18]/10" />

          <div className="mb-8">
            <Skeleton className="mb-4 h-3 w-28 rounded-none bg-[#efe7dc]" />
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="size-8 rounded-full bg-[#efe7dc]"
                />
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <Skeleton className="h-3 w-10 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-3 w-20 rounded-none bg-[#efe7dc]" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-[50px] rounded-sm bg-[#efe7dc]"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full rounded-full bg-[#1c1a18]/20" />
            <Skeleton className="h-14 w-full rounded-full bg-[#efe7dc]" />
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-[#1c1a18]/10 pt-16">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-52 rounded-none bg-[#efe7dc]" />
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
            <Skeleton className="size-10 rounded-full bg-[#efe7dc]" />
          </div>
        </div>

        <div className="flex gap-6 overflow-hidden pb-4 px-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[240px] flex-none space-y-3 sm:min-w-[280px] md:min-w-[320px]"
            >
              <Skeleton className="aspect-[3/4] w-full rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-5 w-3/4 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-3 w-2/5 rounded-none bg-[#efe7dc]" />
              <Skeleton className="h-4 w-1/3 rounded-none bg-[#efe7dc]" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 items-center gap-12 border-t border-[#1c1a18]/10 pt-16 md:grid-cols-2">
        <div className="space-y-4 md:pr-6">
          <Skeleton className="h-3 w-28 rounded-none bg-[#efe7dc]" />
          <Skeleton className="h-10 w-4/5 rounded-none bg-[#efe7dc]" />
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-full rounded-none bg-[#efe7dc]" />
            <Skeleton className="h-3 w-11/12 rounded-none bg-[#efe7dc]" />
            <Skeleton className="h-3 w-4/5 rounded-none bg-[#efe7dc]" />
          </div>
          <div className="space-y-2.5 pt-1">
            <Skeleton className="h-3 w-full rounded-none bg-[#efe7dc]" />
            <Skeleton className="h-3 w-3/4 rounded-none bg-[#efe7dc]" />
          </div>
        </div>
        <Skeleton className="aspect-[16/10] w-full rounded-sm bg-[#efebe4]" />
      </section>
    </div>
  );
}

function ProductDetailContent({ product }: { product: Product }) {
  const { t } = useI18n();

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          {t("storefront.common.home")}
        </Link>
        <span>/</span>
        <Link
          href="/collection"
          className="font-medium text-[#1c1a18] underline decoration-[#1c1a18]/20 underline-offset-4 hover:text-[#b85a3c]"
        >
          {t("storefront.common.collections")}
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
            {t("storefront.product.craftEyebrow")}
          </span>
          <h2 className="mb-6 font-serif text-2xl font-light leading-tight tracking-[0.05em] text-[#1c1a18] md:text-4xl">
            {t("storefront.product.craftTitle")}
          </h2>
          <p className="mb-4 text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
            {t("storefront.product.craftParagraph1")}
          </p>
          <p className="text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
            {t("storefront.product.craftParagraph2")}
          </p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[#1c1a18]/5 bg-[#efebe4]">
          <FashionImage
            src="/images/product-detail/craftsmanship.webp"
            alt={t("storefront.product.craftImageAlt")}
          />
        </div>
      </section>
    </>
  );
}
