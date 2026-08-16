"use client";

import { motion } from "motion/react";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { getCategoryLabel, getProductBadgeLabel, money, Product } from "@/lib/vela-data";

interface HomeProductCardProps {
  product: Product;
}

export function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showAddedToBag } = useNotification();
  const { locale, t } = useI18n();

  const favorited = isFavorite(product.id);
  const flashUnavailable =
    product.pricing?.priceSource === "FLASH_SALE" &&
    product.pricing.remainingQuota != null &&
    product.pricing.remainingQuota <= 0;
  const requiresVariantSelection =
    product.pricing != null && product.pricing.priceSource !== "BASE";

  const displayCategory = getCategoryLabel(product.category, locale);

  return (
    <motion.article
      aria-label={product.name}
      className="group relative flex cursor-pointer flex-col overflow-hidden bg-transparent pb-4 transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-[#efe7dc]">
        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          <Image
            suppressHydrationWarning
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 400px, (min-width: 640px) 340px, 280px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a18]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.badge && (
            <span className="rounded-full bg-[#b5573a] px-3 py-1 text-[10px] font-medium tracking-[1.5px] text-white uppercase shadow-sm">
              {getProductBadgeLabel(product.badge, locale)}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product, product.size || "M");
          }}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f7f4ef]/90 text-[#1c1a18] shadow-sm backdrop-blur-sm"
          whileHover={{ scale: 1.04, backgroundColor: "#efe7dc" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          aria-label={
            favorited
              ? t("storefront.common.removeFromWishlist")
              : t("storefront.common.addToWishlist")
          }
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-300 ${
              favorited ? "fill-[#b5573a] text-[#b5573a]" : "text-[#1c1a18]"
            }`}
          />
        </motion.button>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full overflow-hidden transition-transform duration-300 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0">
          <motion.button
            disabled={flashUnavailable}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (requiresVariantSelection) {
                router.push(`/products/${product.id}`);
                return;
              }
              addToCart(product, product.color || "Sand", product.size || "M");
              showAddedToBag(product, product.size || "M", product.color || "Sand");
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-[#f7f4ef]/95 py-4 text-xs font-medium tracking-[1px] text-[#1c1a18] uppercase transition-colors duration-300 hover:bg-[#b5573a] hover:text-white disabled:cursor-not-allowed disabled:bg-[#1c1a18]/70 disabled:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="h-4 w-4" />
            {flashUnavailable
              ? t("storefront.sale.flashSoldOut")
              : requiresVariantSelection
                ? t("storefront.sale.selectVariant")
                : t("storefront.common.addToBag")}
          </motion.button>
        </div>
      </div>

      {/* Info details */}
      <div className="flex flex-col gap-1.5 px-1 pt-4">
        {/* Category */}
        <p className="text-[11px] font-medium tracking-[1.5px] text-[#8a857c] uppercase">
          {displayCategory}
        </p>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 font-serif text-[18px] font-medium tracking-tight text-[#1c1a18] transition-colors hover:text-[#b5573a]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-0.5 flex items-center gap-2.5">
          <span className="font-numeric text-sm font-semibold text-[#1c1a18]">
            {money(product.price, locale)}
          </span>
          {product.originalPrice && (
            <span className="font-numeric text-xs text-[#8a857c] line-through">
              {money(product.originalPrice, locale)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
