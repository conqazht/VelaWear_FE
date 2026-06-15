"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FashionImage } from "@/components/shop/fashion-image";
import { useCart } from "@/components/shop/cart-provider";
import { categoryLabels, money, Product } from "@/lib/vela-data";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="group h-full gap-0 rounded-md border-transparent bg-white p-3 py-3 transition-all duration-300 hover:border-[#1c1a18]/5 hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-sm bg-[#efebe4]">
          {product.badge && (
            <Badge className="absolute left-4 top-4 z-10 rounded-sm bg-[#1c1a18] px-2 text-[9px] font-bold uppercase tracking-widest text-[#f7f4ef]">
              {product.badge}
            </Badge>
          )}
          <FashionImage
            src={product.image}
            alt={product.name}
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="flex flex-grow flex-col">
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
          onClick={() => addToCart(product)}
          className="mt-4 h-auto w-full rounded-sm bg-[#1c1a18] py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-md hover:bg-[#b85a3c]"
        >
          <ShoppingBag className="size-3.5" />
          Quick Add
        </Button>
      </div>
    </Card>
  );
}
