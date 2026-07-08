import Link from "next/link";

import { CollectionClient } from "@/components/shop/collection-client";
import { FashionImage } from "@/components/shop/fashion-image";
import { PRODUCTS } from "@/lib/vela-data";

export function CollectionPage() {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px] min-h-[calc(100vh-200px)]">
      <div className="mb-4 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">Collections</span>
        <span>/</span>
        <span className="text-[#1c1a18]/40">All Products</span>
      </div>

      <div className="mb-4">
        <h1 className="mb-1 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
          Tất cả sản phẩm
        </h1>
      </div>

      <CollectionClient products={PRODUCTS} />

      <section className="relative mt-4 mb-4 h-[300px] w-full overflow-hidden rounded-lg bg-black">
        <FashionImage
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
          alt="Lookbook visual teaser"
          className="opacity-65"
        />
        <div className="absolute inset-0 bg-[#1c1a18]/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
            Lookbook Autumn 2026
          </span>
          <h2 className="mb-4 font-serif text-3xl font-light uppercase tracking-[0.1em] text-white">
            Coming Soon
          </h2>
          <div className="mb-6 h-px w-10 bg-white/40" />
          <Link
            href="/collection"
            className="rounded-sm bg-white px-6 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-black transition-colors hover:bg-[#efebe4]"
          >
            Khám phá ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
