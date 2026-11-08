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
            className="group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/70 bg-white/92 px-4 py-2.5 text-[11px] font-semibold tracking-widest text-[#1c1a18] uppercase shadow-md backdrop-blur-md transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out hover:border-[#1c1a18] hover:bg-[#1c1a18] hover:text-[#f7f4ef] hover:shadow-lg active:scale-95"
          >
            <Eye className="size-3.5 transition-transform duration-200 group-hover/btn:scale-110" />
            <span>{t("quickView.button")}</span>
          </button>
        ) : undefined
      }
    />
  );
}
