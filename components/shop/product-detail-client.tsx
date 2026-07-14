"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { RatingStars } from "@/components/shop/rating-stars";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useNotification } from "@/components/shop/notification-provider";
import {
  categoryLabels,
  money,
  Product,
} from "@/lib/vela-data";
import { cn } from "@/lib/utils";
import { getActiveLocale } from "@/lib/i18n";
import { useProductReviewsQuery, useProductVariantsQuery } from "@/lib/queries/catalog";

const colorSwatches: Record<string, string> = {
  Black: "bg-[#000000]",
  White: "bg-[#ffffff]",
  Red: "bg-[#d32f2f]",
  Yellow: "bg-[#f2c94c]",
  Purple: "bg-[#7b2cbf]",
  Orange: "bg-[#f97316]",
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
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { showAddedToBag } = useNotification();
  const favorited =
    product.realId !== undefined
      ? favorites.some((item) => item.realId === product.realId || item.id === product.id)
      : isFavorite(product.id);
  const [selectedColor, setSelectedColor] = useState(
    product.colorImages?.[0]?.colorName || product.color
  );
  const [selectedSize, setSelectedSize] = useState(product.size);
  const [activeImage, setActiveImage] = useState(product.image);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sizeAndFit: false,
    materialAndCare: false,
    delivery: false,
    reviews: false,
  });

  const activeLocale = getActiveLocale();
  const variantsQuery = useProductVariantsQuery({
    productId: product.realId,
    size: 100,
    locale: activeLocale,
  });
  const variants = useMemo(
    () => (variantsQuery.data?.result ?? []) as ProductVariant[],
    [variantsQuery.data?.result]
  );
  const reviewsQuery = useProductReviewsQuery({
    productId: product.realId,
    size: 100,
    sort: "createdAt,desc",
  });
  const productReviews = useMemo(
    () => reviewsQuery.data?.result ?? [],
    [reviewsQuery.data?.result]
  );
  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 0;

    const ratingTotal = productReviews.reduce((total, review) => {
      const rating = Number(review.rating);
      return total + (Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0);
    }, 0);
    return ratingTotal / productReviews.length;
  }, [productReviews]);
  const reviewCount = reviewsQuery.data?.meta.total ?? productReviews.length;

  useEffect(() => {
    if (window.location.hash !== "#reviews") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSections((current) => current.reviews ? current : { ...current, reviews: true });
  }, []);

  useEffect(() => {
    if (!openSections.reviews || productReviews.length === 0) return;

    const linkedReviewId = new URLSearchParams(window.location.search).get("review");
    if (!linkedReviewId) return;

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`review-${linkedReviewId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [openSections.reviews, productReviews.length]);

  // Compute available colors and keep the backend gallery order when possible.
  const colorsList = useMemo(() => {
    const unique = new Set<string>();
    product.colorImages?.forEach((group) => {
      if (group.colorName) unique.add(group.colorName);
    });
    variants.forEach((v) => {
      if (v.color?.name) unique.add(v.color.name);
    });
    if (unique.size === 0 && product.color) unique.add(product.color);
    return Array.from(unique);
  }, [product.color, product.colorImages, variants]);

  const resolvedSelectedColor =
    colorsList.find((color) => color.toLowerCase() === selectedColor?.toLowerCase()) ||
    colorsList[0] ||
    product.color;

  const sizesList = useMemo(() => {
    if (variants.length === 0) return product.size ? [product.size] : [];
    const unique = new Set<string>();
    variants
      .filter(
        (v) =>
          !resolvedSelectedColor ||
          v.color?.name?.toLowerCase() === resolvedSelectedColor.toLowerCase()
      )
      .forEach((v) => {
        if (v.size?.name) unique.add(v.size.name);
      });
    return Array.from(unique);
  }, [product.size, resolvedSelectedColor, variants]);

  const resolvedSelectedSize =
    sizesList.find((size) => size.toLowerCase() === selectedSize?.toLowerCase()) ||
    sizesList[0] ||
    product.size;

  // Find currently active variant matching selection
  const activeVariant = useMemo(() => {
    return variants.find(
      (v) =>
        v.color?.name?.toLowerCase() === resolvedSelectedColor?.toLowerCase() &&
        v.size?.name?.toLowerCase() === resolvedSelectedSize?.toLowerCase()
    );
  }, [resolvedSelectedColor, resolvedSelectedSize, variants]);

  const gallery = useMemo(() => {
    const selectedGroup = product.colorImages?.find(
      (group) => group.colorName.toLowerCase() === resolvedSelectedColor?.toLowerCase()
    );
    const colorImages = selectedGroup
      ? [selectedGroup.thumbnail, ...selectedGroup.images].filter(
          (image): image is string => Boolean(image)
        )
      : [];
    const rawImages = colorImages.length > 0
      ? colorImages
      : product.images && product.images.length > 0
        ? product.images
        : [product.image];

    return Array.from(new Set(rawImages)).map((src, idx) => ({
      src,
      label: `${resolvedSelectedColor || "Product"} look ${idx + 1}`,
    }));
  }, [product.colorImages, product.image, product.images, resolvedSelectedColor]);
  const displayedImage = gallery.some((detail) => detail.src === activeImage)
    ? activeImage
    : gallery[0]?.src || product.image;

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
    <div className="mb-24 grid grid-cols-1 items-start gap-10 xl:grid-cols-[631px_360px] xl:justify-center xl:gap-x-6 2xl:grid-cols-[631px_380px] 2xl:gap-x-8">
      {/* LEFT COLUMN: Vertical Gallery & Main Image */}
      <div className="flex gap-4 select-none justify-start xl:w-[631px]">
        {/* Vertical Thumbnail List */}
        <div className="flex w-16 flex-none flex-col gap-2 sm:w-20">
          {gallery.map((detail) => (
            <button
              key={detail.src}
              type="button"
              onClick={() => setActiveImage(detail.src)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-none border bg-[#efebe4] transition-all cursor-pointer",
                displayedImage === detail.src
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
        <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efebe4] xl:h-[668.75px] xl:w-[535px] xl:flex-none">
          <FashionImage
            src={displayedImage}
            alt={product.name}
            priority
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Product Info & Actions */}
      <div className="flex h-full flex-col justify-start text-left xl:w-[360px] xl:pt-1 2xl:w-[380px]">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
          {categoryLabels[product.category] ?? product.category} / Fine tailored craftsmanship
        </span>
        <h1 className="mb-4 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-display-lg leading-tight">
          {product.name}
        </h1>
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-serif text-2xl font-light tracking-wider text-[#1c1a18] font-numeric">
            {money(mainPrice)}
          </span>
          {originalPrice && originalPrice > mainPrice && (
            <span className="text-sm tracking-wider text-[#1c1a18]/40 line-through font-numeric">
              {money(originalPrice)}
            </span>
          )}
        </div>

        <Separator className="mb-8 bg-[#1c1a18]/10" />

        {/* Color Selection */}
        <div className="mb-8">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#1c1a18]/60 mb-4">
            Color — {resolvedSelectedColor}
          </span>
          <div className="flex gap-4">
            {colorsList.map((color) => {
              const hexCode = product.colorImages?.find(
                (group) => group.colorName.toLowerCase() === color.toLowerCase()
              )?.hexCode;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={color}
                  style={hexCode ? { backgroundColor: hexCode } : undefined}
                  className={cn(
                    "w-8 h-8 rounded-full border transition-all cursor-pointer ring-2 ring-offset-2",
                    !hexCode && (colorSwatches[color] || "bg-[#d32f2f]"),
                    resolvedSelectedColor === color
                      ? "border-[#1c1a18] ring-[#1c1a18]/30 scale-105"
                      : "border-[#1c1a18]/15 ring-transparent hover:ring-hairline hover:scale-105"
                  )}
                />
              );
            })}
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
                  resolvedSelectedSize === size
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
              const cartProduct = { ...product, price: mainPrice, variantId: activeVariant?.id };
              addToCart(cartProduct, resolvedSelectedColor, resolvedSelectedSize);
              showAddedToBag(cartProduct, resolvedSelectedSize, resolvedSelectedColor);
            }}
            className="w-full h-14 bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-widest uppercase rounded-full transition-colors cursor-pointer border-none shadow-sm flex items-center justify-center"
          >
            Thêm vào giỏ
          </Button>

          <button
            type="button"
            onClick={() => toggleFavorite(product, resolvedSelectedSize)}
            className={cn(
              "w-full h-14 border font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded-full",
              favorited
                ? "bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200"
                : "border-neutral-300 bg-white text-black hover:border-black"
            )}
          >
            <span>{favorited ? "Favorited" : "Favourite"}</span>
            <Heart className={cn("size-4 transition-transform active:scale-95 duration-200", favorited && "fill-black stroke-black")} />
          </button>
        </div>

        {/* Product Description */}
        <p className="mt-10 mb-6 text-xs font-light leading-relaxed tracking-wide text-[#1c1a18]/70 md:text-sm">
          {product.description}
        </p>

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

          {/* Material & Care */}
          {(product.material || product.care) && (
            <div className="border-b border-hairline/40 py-5">
              <button
                type="button"
                onClick={() => toggleSection("materialAndCare")}
                className="flex justify-between items-center w-full group text-left cursor-pointer"
              >
                <h3 className="font-serif text-lg font-light tracking-wide text-ink group-hover:text-[#b85a3c] transition-colors">
                  Material & Care
                </h3>
                {openSections.materialAndCare ? (
                  <ChevronUp className="size-4 text-ink/70" />
                ) : (
                  <ChevronDown className="size-4 text-ink/70" />
                )}
              </button>
              {openSections.materialAndCare && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2 text-xs font-light tracking-wide text-on-surface-variant/80 leading-relaxed">
                    {product.material && (
                      <p>
                        <span className="font-medium text-ink">Material:</span> {product.material}
                      </p>
                    )}
                    {product.care && (
                      <p>
                        <span className="font-medium text-ink">Care Instructions:</span> {product.care}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
                  Your order of 500,000đ or more gets free standard delivery.
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

          {/* Product reviews */}
          <div id="reviews" className="scroll-mt-32 border-b border-hairline/40 py-5">
            <button
              type="button"
              onClick={() => toggleSection("reviews")}
              className="flex justify-between items-center w-full group text-left cursor-pointer"
            >
              <h3 className="font-serif text-lg font-light tracking-wide text-ink group-hover:text-[#b85a3c] transition-colors">
                Reviews ({reviewCount})
              </h3>
              <div className="flex items-center gap-4">
                <RatingStars
                  rating={averageRating}
                  sizeClassName="size-3"
                  className="gap-0.5"
                  activeClassName="text-[#b85a3c]"
                  inactiveClassName="text-[#55423d]/20"
                />
                {openSections.reviews ? (
                  <ChevronUp className="size-4 text-ink/70" />
                ) : (
                  <ChevronDown className="size-4 text-ink/70" />
                )}
              </div>
            </button>
            {openSections.reviews && (
              <div className="mt-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                {reviewsQuery.isLoading ? (
                  <div className="space-y-3" aria-hidden="true">
                    <div className="h-16 animate-pulse rounded-sm bg-[#efe7dc]" />
                    <div className="h-16 animate-pulse rounded-sm bg-[#efe7dc]" />
                  </div>
                ) : reviewsQuery.isError ? (
                  <p className="text-xs font-light leading-relaxed text-on-surface-variant/80">
                    Không thể tải đánh giá lúc này. Vui lòng thử lại sau.
                  </p>
                ) : productReviews.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-ink">Chưa có đánh giá</p>
                    <p className="text-xs font-light tracking-wide text-on-surface-variant/80 max-w-sm leading-relaxed">
                      Hãy là người đầu tiên chia sẻ trải nghiệm về {product.name}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-hairline/40 pb-4">
                      <span className="font-serif text-2xl text-ink">{averageRating.toFixed(1)}</span>
                      <div>
                        <RatingStars
                          rating={averageRating}
                          sizeClassName="size-4"
                          activeClassName="text-[#b85a3c]"
                        />
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant/65">
                          {reviewCount} đánh giá
                        </p>
                      </div>
                    </div>
                    <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                      {productReviews.map((review) => (
                        <article
                          key={review.id}
                          id={`review-${review.id}`}
                          className="scroll-mt-40 border-b border-hairline/30 pb-4 last:border-0"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-ink">{review.userName}</p>
                              {review.createdAt && (
                                <time className="text-[10px] text-on-surface-variant/55">
                                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                </time>
                              )}
                            </div>
                            <RatingStars rating={review.rating} sizeClassName="size-3" className="gap-0.5" />
                          </div>
                          <p className="text-xs font-light leading-relaxed text-on-surface-variant/85">
                            {review.comment || "Khách hàng không để lại bình luận."}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
