"use client";

import { useState } from "react";
import { RotateCcw, ShoppingBag, Truck, Heart } from "lucide-react";

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

const colorSwatches: Record<string, string> = {
  Sand: "bg-[#e5dfd5]",
  Terracotta: "bg-[#b85a3c]",
  Ink: "bg-[#2c3539]",
};

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

  return (
    <div className="mb-24 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="flex flex-col gap-6 lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-[#1c1a18]/5 bg-[#efebe4]">
          <FashionImage src={activeImage} alt={product.name} priority />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {gallery.map((detail) => (
            <button
              key={detail.src}
              type="button"
              onClick={() => setActiveImage(detail.src)}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-sm border-2 bg-[#efebe4] transition-all",
                activeImage === detail.src
                  ? "scale-[0.98] border-[#b85a3c]"
                  : "border-transparent opacity-75 hover:opacity-100"
              )}
              aria-label={detail.label}
            >
              <FashionImage src={detail.src} alt={detail.label} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-full flex-col justify-center lg:col-span-5">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
          {categoryLabels[product.category] ?? product.category} / Fine tailored
          craftsmanship
        </span>
        <h1 className="mb-4 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-4xl">
          {product.name}
        </h1>
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-serif text-2xl font-light tracking-wider text-[#1c1a18]">
            {money(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm tracking-wider text-[#1c1a18]/40 line-through">
              {money(product.originalPrice)}
            </span>
          )}
        </div>

        <Separator className="mb-8 bg-[#1c1a18]/10" />
        <p className="mb-10 text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
          {product.description}
        </p>

        <div className="mb-8">
          <span className="mb-3 block text-[10px] font-medium uppercase tracking-widest text-[#1c1a18]/60">
            Color Selected:{" "}
            <strong className="font-bold text-[#1c1a18]">{selectedColor}</strong>
          </span>
          <div className="flex gap-3">
            {["Sand", "Terracotta", "Ink"].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "size-8 rounded-full transition-transform",
                  colorSwatches[color],
                  selectedColor === color
                    ? "scale-110 ring-2 ring-[#b85a3c] ring-offset-2"
                    : "hover:scale-105"
                )}
                aria-label={`Select ${color}`}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="mb-10">
          <span className="mb-3 block text-[10px] font-medium uppercase tracking-widest text-[#1c1a18]/60">
            Size Selected:{" "}
            <strong className="font-bold text-[#1c1a18]">{selectedSize}</strong>
          </span>
          <div className="flex gap-2.5">
            {["S", "M", "L", "XL"].map((size) => (
              <Button
                key={size}
                type="button"
                variant="outline"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "size-12 rounded-sm border text-xs font-semibold tracking-wider",
                  selectedSize === size
                    ? "border-[#1c1a18] bg-[#1c1a18] text-white hover:bg-[#1c1a18]"
                    : "border-[#1c1a18]/15 bg-white text-[#1c1a18] hover:border-[#1c1a18]/40 hover:bg-white"
                )}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => {
              addToCart(product, selectedColor, selectedSize);
              showAddedToBag(product, selectedSize, selectedColor);
            }}
            className="h-auto flex-grow rounded-sm bg-[#1c1a18] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#b85a3c]"
          >
            <ShoppingBag className="size-4" />
            Thêm vào giỏ
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => toggleFavorite(product, selectedSize)}
            className={cn(
              "h-auto px-6 rounded-sm border py-4 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 border-[#1c1a18]/15 bg-white text-[#1c1a18] hover:border-[#1c1a18]/40 hover:bg-[#1c1a18]/5",
              favorited && "border-[#b5573a] text-[#b5573a] hover:bg-[#b5573a]/5 hover:border-[#b5573a]"
            )}
          >
            <Heart className={cn("size-4.5 mr-1.5", favorited && "fill-[#b5573a] stroke-[#b5573a]")} />
            {favorited ? "Yêu thích" : "Lưu"}
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[10px] text-[#1c1a18]/60">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-[#b85a3c]" />
            <span>Miễn phí vận chuyển toàn quốc cho tất cả sản phẩm VELA WEAR</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4 text-[#b85a3c]" />
            <span>Hỗ trợ thử tại nhà, đổi trả dễ dàng tận nhà trong vòng 30 ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
}
