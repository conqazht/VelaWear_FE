"use client";

import type { ReactNode } from "react";
import { ProductCardShell } from "@/components/shop/product-card-shell";
import { getCategoryLabel, getProductBadgeLabel, money, Product } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";

interface ProductCardProps {
  product: Product;
  imageAspect?: "portrait" | "square" | "collection";
  imageAction?: ReactNode;
  footerAction?: ReactNode;
}

export function ProductCard({
  product,
  imageAction,
  footerAction,
}: ProductCardProps) {
  const { locale } = useI18n();

  return (
    <ProductCardShell
      href={`/products/${product.id}`}
      imageSrc={product.image}
      imageAlt={product.name}
      badge={product.badge ? getProductBadgeLabel(product.badge, locale) : undefined}
      imageAction={imageAction}
      eyebrow={getCategoryLabel(product.category, locale)}
      title={product.name}
      price={money(product.price, locale)}
      originalPrice={
        product.originalPrice ? money(product.originalPrice, locale) : undefined
      }
      footerAction={footerAction}
    />
  );
}
