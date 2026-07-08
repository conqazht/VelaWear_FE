"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FashionImage } from "@/components/shop/fashion-image";
import { ProductDetailClient } from "@/components/shop/product-detail-client";
import { RelatedProducts } from "@/components/shop/related-products";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import apiClient from "@/lib/api-client";
import { getActiveLocale } from "@/lib/i18n";

export function ProductDetailPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activeLocale = getActiveLocale();

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await apiClient.get(`/products/slug/${slug}?locale=${activeLocale}`);
        if (response.data?.data) {
          setProduct(mapBackendProduct(response.data.data, activeLocale));
        }
      } catch (err) {
        console.error("Failed to load product by slug", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug, activeLocale]);

  if (isLoading || !product) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-32 text-center select-none md:px-16">
        <span className="text-xs uppercase tracking-widest text-[#1c1a18]/50">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
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
    </div>
  );
}
