"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FashionImage } from "@/components/shop/fashion-image";
import { cn } from "@/lib/utils";
import { categoryLabels, money, Product } from "@/lib/vela-data";

interface ProductCardProps {
  product: Product;
  imageAspect?: "portrait" | "square" | "collection";
  imageAction?: ReactNode;
  footerAction?: ReactNode;
}

const imageAspectClass: Record<NonNullable<ProductCardProps["imageAspect"]>, string> = {
  portrait: "aspect-square",
  square: "aspect-square",
  collection: "aspect-square",
};

export function ProductCard({
  product,
  imageAspect = "portrait",
  imageAction,
  footerAction,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-md border-transparent bg-white transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#1c1a18]/5 hover:shadow-xl",
        "p-0"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-none bg-[#efebe4]",
          imageAspectClass[imageAspect]
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
        {imageAction && (
          <div className="absolute right-4 top-4 z-20">
            {imageAction}
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex flex-grow flex-col items-start text-left",
          "px-4 pt-5 pb-6"
        )}
      >
        <span className="mb-1.5 text-[12px] md:text-[13px] font-medium uppercase tracking-widest text-[#1c1a18]/60">
          {categoryLabels[product.category] ?? product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2.5 font-serif text-[16px] md:text-[18px] font-medium leading-snug text-[#1c1a18] transition-colors hover:text-[#b85a3c]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="text-[14px] md:text-[15px] font-semibold tracking-wider text-[#1c1a18] font-numeric">
            {money(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[12px] font-light tracking-widest text-[#1c1a18]/40 line-through font-numeric">
              {money(product.originalPrice)}
            </span>
          )}
        </div>
        {footerAction && <div className="mt-5 w-full">{footerAction}</div>}
      </div>
    </Card>
  );
}
