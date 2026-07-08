"use client";

import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FashionImage } from "@/components/shop/fashion-image";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { cn } from "@/lib/utils";
import { categoryLabels, money, Product } from "@/lib/vela-data";

interface ProductCardProps {
  product: Product;
  imageAspect?: "portrait" | "square" | "collection";
}

export function ProductCard({ product, imageAspect = "portrait" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showAddedToBag } = useNotification();

  const favorited = isFavorite(product.id);

  return (
    <Card
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-md border-transparent bg-white transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#1c1a18]/5 hover:shadow-xl",
        imageAspect === "square" ? "p-0" : "p-3 py-3"
      )}
      style={
        imageAspect === "square"
          ? { width: "100%", minHeight: "560px" }
          : imageAspect === "collection"
            ? { width: "100%", minHeight: "500px" }
            : undefined
      }
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-none bg-[#efebe4]",
          imageAspect === "square"
            ? "h-[400px]"
            : imageAspect === "collection"
              ? "aspect-[4/5]"
              : "aspect-[3/4]"
        )}
      >
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          {product.badge && (
            <Badge className="absolute left-4 top-4 z-10 rounded-sm bg-[#1c1a18] px-2 text-[9px] font-bold uppercase tracking-widest text-[#f7f4ef]">
              {product.badge}
            </Badge>
          )}
          <FashionImage
            src={product.image}
            alt={product.name}
            className="transition-none"
          />
        </Link>

        {/* Favorites Heart Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product, product.size || "M");
          }}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-canvas/80 backdrop-blur-md shadow-sm hover:bg-white text-ink transition-colors cursor-pointer border border-hairline/25"
          aria-label={favorited ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart
            className={cn(
              "size-4 transition-transform active:scale-95 duration-200",
              favorited
                ? "fill-[#b5573a] stroke-[#b5573a]"
                : "stroke-[#1c1a18] hover:scale-105"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "flex flex-grow flex-col",
          imageAspect === "square"
            ? "px-[40px] pt-4 pb-5"
            : imageAspect === "collection"
              ? "px-0 pt-4 pb-4"
              : "px-0"
        )}
      >
        <span className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#1c1a18]/45">
          {categoryLabels[product.category] ?? product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 font-serif text-base font-semibold text-[#1c1a18] transition-colors hover:text-[#b85a3c]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-[#1c1a18]">
            {money(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] font-light tracking-widest text-[#1c1a18]/40 line-through">
              {money(product.originalPrice)}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={() => {
            addToCart(product);
            showAddedToBag(product, product.size || "M", product.color || "Sand");
          }}
          className="mt-4 h-auto w-full rounded-sm bg-[#1c1a18] py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-md hover:bg-[#b85a3c]"
        >
          <ShoppingBag className="size-3.5" />
          Quick Add
        </Button>
      </div>
    </Card>
  );
}
