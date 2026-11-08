"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FashionImage } from "@/components/shop/fashion-image";
import { SocialProofPill } from "@/components/shop/social-proof-pill";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { getCategoryLabel, money, Product } from "@/lib/vela-data";
import { cn } from "@/lib/utils";

const colorSwatches: Record<string, string> = {
  Black: "bg-[#000000]",
  White: "bg-[#ffffff]",
  Red: "bg-[#d32f2f]",
  Yellow: "bg-[#f2c94c]",
  Purple: "bg-[#7b2cbf]",
  Orange: "bg-[#f97316]",
};

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function QuickViewDialogContent({
  product,
  onOpenChange,
}: {
  product: Product;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, t } = useI18n();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  const defaultColor = product.colorImages?.[0]?.colorName || product.color || "Black";
  const defaultSize = product.size || "M";

  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [activeImage, setActiveImage] = useState<string>(product.image);

  const colorsList = useMemo(() => {
    const unique = new Set<string>();
    product.colorImages?.forEach((group) => {
      if (group.colorName) unique.add(group.colorName);
    });
    if (unique.size === 0 && product.color) unique.add(product.color);
    if (unique.size === 0) unique.add("Black");
    return Array.from(unique);
  }, [product]);

  const sizesList = useMemo(() => {
    return ["XS", "S", "M", "L", "XL"];
  }, []);

  const handleAddToCart = () => {
    const cartProduct = {
      ...product,
      color: selectedColor,
      size: selectedSize,
    };
    addToCart(cartProduct, selectedColor, selectedSize);
    showAddedToBag(cartProduct, selectedSize, selectedColor);
    onOpenChange(false);
  };

  return (
    <DialogContent
      showCloseButton={false}
      className="max-h-[90vh] w-[95vw] overflow-hidden rounded-2xl border-none bg-white p-0 shadow-2xl focus:outline-none sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
    >
      <DialogTitle className="sr-only">
        {t("quickView.title")} - {product.name}
      </DialogTitle>
      <DialogDescription className="sr-only">{t("quickView.viewDetails")}</DialogDescription>

      <div className="relative grid grid-cols-1 md:h-[620px] md:grid-cols-12">
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#1c1a18] shadow-md backdrop-blur-md transition-[background-color,color,transform] duration-150 hover:bg-[#1c1a18] hover:text-white active:scale-90"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Left Column: Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f2ec] md:col-span-6 md:aspect-auto md:h-full">
          <FashionImage
            src={activeImage || product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out"
          />
          {product.badge ? (
            <Badge className="absolute top-4 left-4 z-10 rounded-full bg-[#1c1a18] px-3 py-1 text-[10px] font-bold tracking-widest text-[#f7f4ef] uppercase">
              {product.badge}
            </Badge>
          ) : null}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-6 md:overflow-y-auto">
          <div>
            <span className="text-[11px] font-medium tracking-[0.2em] text-[#1c1a18]/60 uppercase">
              {getCategoryLabel(product.category, locale)}
            </span>
            <h2 className="mt-1 font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-serif text-2xl font-medium text-[#1c1a18]">
                {money(product.price, locale)}
              </span>
              {product.originalPrice ? (
                <span className="text-sm text-[#1c1a18]/40 line-through">
                  {money(product.originalPrice, locale)}
                </span>
              ) : null}
            </div>

            {/* Social proof & Stock scarcity */}
            <div className="mt-4">
              <SocialProofPill productId={product.id} />
            </div>

            {/* Color Selection */}
            {colorsList.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs tracking-wider uppercase">
                  <span className="font-medium text-[#1c1a18]">{t("quickView.selectColor")}</span>
                  <span className="text-[#1c1a18]/60">{selectedColor}</span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {colorsList.map((color) => {
                    const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                    const swatchClass = colorSwatches[color] || "bg-stone-500";
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          const matchingGroup = product.colorImages?.find(
                            (g) => g.colorName?.toLowerCase() === color.toLowerCase(),
                          );
                          if (matchingGroup?.images?.[0]) {
                            setActiveImage(matchingGroup.images[0]);
                          }
                        }}
                        className={cn(
                          "relative size-8 rounded-full border border-stone-200 transition-transform duration-150 active:scale-90",
                          swatchClass,
                          isSelected && "ring-2 ring-[#1c1a18] ring-offset-2",
                        )}
                        title={color}
                      >
                        {isSelected && (
                          <Check
                            className={cn(
                              "absolute inset-0 m-auto size-3.5 stroke-[3]",
                              color.toLowerCase() === "white" ? "text-black" : "text-white",
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase">
                <span className="font-medium text-[#1c1a18]">{t("quickView.selectSize")}</span>
                <span className="text-[#1c1a18]/60">{selectedSize}</span>
              </div>
              <div className="mt-2.5 grid grid-cols-5 gap-2">
                {sizesList.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg border text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-95",
                        isSelected
                          ? "border-[#1c1a18] bg-[#1c1a18] text-white shadow-sm"
                          : "border-[#efe7dc] bg-[#fbf9f5] text-[#1c1a18] hover:border-[#1c1a18]/40 hover:bg-white",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 space-y-3">
            <Button
              type="button"
              onClick={handleAddToCart}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-[#1c1a18] text-xs font-semibold tracking-widest text-white uppercase shadow-md transition-[background-color,transform] duration-150 hover:bg-[#b5573a] active:scale-[0.98]"
            >
              <ShoppingBag className="size-4" />
              {t("quickView.addToBag")}
            </Button>

            <div className="text-center">
              <Link
                href={`/products/${product.id}`}
                onClick={() => onOpenChange(false)}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#b5573a] uppercase hover:underline"
              >
                {t("quickView.viewDetails")}
                <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <QuickViewDialogContent key={product.id} product={product} onOpenChange={onOpenChange} />
    </Dialog>
  );
}
