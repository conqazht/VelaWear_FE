"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  ChevronUp,
  ChevronDown,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useNotification } from "@/components/shop/notification-provider";
import {
  categoryLabels,
  DETAIL_IMAGES,
  money,
  Product,
} from "@/lib/vela-data";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

const colorSwatches: Record<string, string> = {
  Sand: "bg-[#efe7dc]",
  Terracotta: "bg-[#b85a3c]",
  Ink: "bg-[#1c1a18]",
};

interface VariantColorInfo {
  id: number;
  name: string;
}

interface VariantSizeInfo {
  id: number;
  name: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  color: VariantColorInfo | null;
  size: VariantSizeInfo | null;
  status: string;
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showAddedToBag } = useNotification();
  const favorited = isFavorite(product.id);
  const gallery =
    product.id === "linen-blazer"
      ? DETAIL_IMAGES
      : [{ src: product.image, label: "Main Look" }];
  const [activeImage, setActiveImage] = useState(gallery[0].src);
  const [selectedColor, setSelectedColor] = useState(product.color);
  const [selectedSize, setSelectedSize] = useState(product.size);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sizeAndFit: true,
    delivery: false,
    reviews: false,
  });

  // Fetch product variants on mount
  useEffect(() => {
    if (!product.realId) return;
    async function loadVariants() {
      try {
        const response = await apiClient.get(`/product-variants?productId=${product.realId}&size=100`);
        if (response.data?.data?.result) {
          setVariants(response.data.data.result);
        }
      } catch (err) {
        console.error("Failed to load product variants", err);
      }
    }
    loadVariants();
  }, [product.realId]);

  // Set default selected color/size once variants load
  useEffect(() => {
    if (variants.length > 0) {
      const first = variants[0];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (first.color?.name) setSelectedColor(first.color.name);
      if (first.size?.name) setSelectedSize(first.size.name);
    }
  }, [variants]);

  // Compute available colors and sizes
  const colorsList = useMemo(() => {
    if (variants.length === 0) return ["Sand", "Terracotta", "Ink"];
    const unique = new Set<string>();
    variants.forEach((v) => {
      if (v.color?.name) unique.add(v.color.name);
    });
    return Array.from(unique);
  }, [variants]);

  const sizesList = useMemo(() => {
    if (variants.length === 0) return ["S", "M", "L", "XL"];
    const unique = new Set<string>();
    variants.forEach((v) => {
      if (v.size?.name) unique.add(v.size.name);
    });
    return Array.from(unique);
  }, [variants]);

  // Find currently active variant matching selection
  const activeVariant = useMemo(() => {
    return variants.find(
      (v) =>
        v.color?.name?.toLowerCase() === selectedColor?.toLowerCase() &&
        v.size?.name?.toLowerCase() === selectedSize?.toLowerCase()
    );
  }, [variants, selectedColor, selectedSize]);

  // Pricing hierarchy: active variant sale price > variant price > static product catalog price
  const displayPrice = activeVariant ? Number(activeVariant.price) : product.price;
  const displayOriginalPrice = activeVariant && activeVariant.salePrice 
    ? Number(activeVariant.price) 
    : product.originalPrice;
  const mainPrice = activeVariant && activeVariant.salePrice ? Number(activeVariant.salePrice) : displayPrice;
  const originalPrice = activeVariant && activeVariant.salePrice ? Number(activeVariant.price) : displayOriginalPrice;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="mb-24 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
      {/* LEFT COLUMN: Vertical Gallery & Main Image */}
      <div className="flex gap-4 lg:col-span-7 select-none">
        {/* Vertical Thumbnail List */}
        <div className="flex flex-col gap-2 w-20 flex-none">
          {gallery.map((detail) => (
            <button
              key={detail.src}
              type="button"
              onClick={() => setActiveImage(detail.src)}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-none border bg-[#efebe4] transition-all cursor-pointer",
                activeImage === detail.src
                  ? "border-[#1c1a18] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              aria-label={detail.label}
            >
              <FashionImage
                src={detail.src}
                alt={detail.label}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>

        {/* Main Product Image */}
        <div className="flex-1 aspect-[3/4] relative overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efebe4]">
          <FashionImage
            src={activeImage}
            alt={product.name}
            priority
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Product Info & Actions */}
      <div className="flex h-full flex-col justify-center lg:col-span-5 text-left">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
          {categoryLabels[product.category] ?? product.category} / Fine tailored craftsmanship
        </span>
        <h1 className="mb-4 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-display-lg leading-tight">
          {product.name}
        </h1>
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-serif text-2xl font-light tracking-wider text-[#1c1a18]">
            {money(mainPrice)}
          </span>
          {originalPrice && originalPrice > mainPrice && (
            <span className="text-sm tracking-wider text-[#1c1a18]/40 line-through">
              {money(originalPrice)}
            </span>
          )}
        </div>

        <Separator className="mb-8 bg-[#1c1a18]/10" />
        
        <p className="mb-10 text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
          {product.description}
        </p>

        {/* Color Selection */}
        <div className="mb-8">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#1c1a18]/60 mb-4">
            Color — {selectedColor}
          </span>
          <div className="flex gap-4">
            {colorsList.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={color}
                className={cn(
                  "w-8 h-8 rounded-full border transition-all cursor-pointer ring-2 ring-offset-2",
                  colorSwatches[color] || "bg-[#b85a3c]",
                  selectedColor === color
                    ? "border-[#1c1a18] ring-[#1c1a18]/30 scale-105"
                    : "border-transparent ring-transparent hover:ring-hairline hover:scale-105"
                )}
              />
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1c1a18]/60">Size</span>
            <a className="text-[10px] font-semibold uppercase tracking-widest underline hover:text-[#b85a3c] transition-colors" href="#">
              Size Guide
            </a>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {sizesList.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "py-3 border font-semibold text-xs tracking-wider transition-colors cursor-pointer rounded-sm",
                  selectedSize === size
                    ? "border-[#1c1a18] bg-[#efe7dc] text-ink"
                    : "border-hairline hover:border-ink text-ink/75"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              // Construct product with active variant pricing
              const cartProduct = { ...product, price: mainPrice };
              addToCart(cartProduct, selectedColor, selectedSize);
              showAddedToBag(cartProduct, selectedSize, selectedColor);
            }}
            className="w-full py-4 bg-[#b5573a] hover:bg-[#964025] text-white font-semibold text-xs tracking-widest uppercase rounded-sm transition-colors cursor-pointer border-none shadow-sm h-auto"
          >
            Thêm vào giỏ
          </Button>

          <button
            type="button"
            onClick={() => toggleFavorite(product, selectedSize)}
            className={cn(
              "w-full py-4 border rounded-sm font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer h-auto",
              favorited
                ? "bg-[#b5573a] border-[#b5573a] text-white hover:bg-[#964025] hover:border-[#964025]"
                : "border-ink bg-transparent text-ink hover:bg-ink hover:text-white"
            )}
          >
            <span>{favorited ? "Favorited" : "Favourite"}</span>
            <Heart className={cn("size-4 transition-transform active:scale-95 duration-200", favorited && "fill-white stroke-white")} />
          </button>
        </div>

        {/* DETAILS ACCORDION SECTIONS */}
        <div className="mt-12 flex flex-col gap-6 text-left border-t border-hairline/40">
          {/* Size & Fit */}
          <div className="border-b border-hairline/40 py-5">
            <button
              type="button"
              onClick={() => toggleSection("sizeAndFit")}
              className="flex justify-between items-center w-full group text-left cursor-pointer"
            >
              <h3 className="font-serif text-lg font-light tracking-wide text-ink group-hover:text-[#b85a3c] transition-colors">
                Size & Fit
              </h3>
              {openSections.sizeAndFit ? (
                <ChevronUp className="size-4 text-ink/70" />
              ) : (
                <ChevronDown className="size-4 text-ink/70" />
              )}
            </button>
            {openSections.sizeAndFit && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <ul className="list-disc pl-5 space-y-2 text-xs font-light tracking-wide text-on-surface-variant/80">
                  <li>{"Model is wearing size M and is 6'1\" (185cm approx.)"}</li>
                  <li>Loose fit: roomy and relaxed</li>
                  <li>
                    <a className="underline hover:text-[#b85a3c] transition-colors" href="#">
                      Size Guide
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Free Delivery and Returns */}
          <div className="border-b border-hairline/40 py-5">
            <button
              type="button"
              onClick={() => toggleSection("delivery")}
              className="flex justify-between items-center w-full group text-left cursor-pointer"
            >
              <h3 className="font-serif text-lg font-light tracking-wide text-ink group-hover:text-[#b85a3c] transition-colors">
                Free Delivery and Returns
              </h3>
              {openSections.delivery ? (
                <ChevronUp className="size-4 text-ink/70" />
              ) : (
                <ChevronDown className="size-4 text-ink/70" />
              )}
            </button>
            {openSections.delivery && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-light tracking-wide text-on-surface-variant/80 mb-3 leading-relaxed">
                  Your order of $200.00 or more gets free standard delivery.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs font-light tracking-wide text-on-surface-variant/80">
                  <li>Standard delivered 4-5 Business Days</li>
                  <li>Express delivered 2-4 Business Days</li>
                </ul>
                <p className="mt-3 text-xs font-light tracking-wide text-on-surface-variant/80 leading-relaxed">
                  Orders are processed and delivered Monday-Friday (excluding public holidays)
                </p>
                <p className="mt-2 text-xs font-light tracking-wide text-on-surface-variant/80 leading-relaxed">
                  Vela Members enjoy{" "}
                  <a className="underline hover:text-[#b85a3c] transition-colors" href="#">
                    free returns
                  </a>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Reviews (0) */}
          <div className="border-b border-hairline/40 py-5">
            <button
              type="button"
              onClick={() => toggleSection("reviews")}
              className="flex justify-between items-center w-full group text-left cursor-pointer"
            >
              <h3 className="font-serif text-lg font-light tracking-wide text-ink group-hover:text-[#b85a3c] transition-colors">
                Reviews (0)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex text-on-surface-variant/40 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 text-[#55423d]/45" />
                  ))}
                </div>
                {openSections.reviews ? (
                  <ChevronUp className="size-4 text-ink/70" />
                ) : (
                  <ChevronDown className="size-4 text-ink/70" />
                )}
              </div>
            </button>
            {openSections.reviews && (
              <div className="flex flex-col items-start gap-3 mt-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                <div className="flex text-on-surface-variant/30 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 text-[#55423d]/30" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-ink">No reviews</p>
                <p className="text-xs font-light tracking-wide text-on-surface-variant/80 max-w-sm leading-relaxed">
                  Have your say. Be the first to review the {product.name}.
                </p>
                <button className="mt-2 px-6 py-2.5 border border-ink rounded-sm font-semibold text-xs tracking-wider uppercase bg-transparent text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer">
                  Write a review
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
