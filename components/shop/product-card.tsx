"use client";

import type { ReactNode } from "react";
import { Eye } from "lucide-react";
import { ProductCardShell } from "@/components/shop/product-card-shell";
import { getCategoryLabel, getProductBadgeLabel, money, Product } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";

interface ProductCardProps {
  product: Product;
  imageAspect?: "portrait" | "square" | "collection";
  imageAction?: ReactNode;
  footerAction?: ReactNode;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, imageAction, footerAction, onQuickView }: ProductCardProps) {
  const { locale, t } = useI18n();

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
      originalPrice={product.originalPrice ? money(product.originalPrice, locale) : undefined}
      footerAction={footerAction}
      quickViewAction={
        onQuickView ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-[11px] font-semibold tracking-wider text-[#1c1a18] uppercase shadow-md backdrop-blur-xs transition-colors hover:bg-[#1c1a18] hover:text-white"
          >
            <Eye className="size-3.5" />
            {t("quickView.button")}
          </button>
        ) : undefined
      }
    />
  );
}
