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
      className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300 pb-4"
      whileHover={{ y: -4 }}
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] w-full bg-[#efe7dc] overflow-hidden rounded-none">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a18]/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.badge && (
            <span className="bg-[#b5573a] text-white text-[10px] font-medium uppercase tracking-[1.5px] px-3 py-1 rounded-full shadow-sm">
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
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-[#f7f4ef]/90 text-[#1c1a18] shadow-sm cursor-pointer z-10 backdrop-blur-sm"
          whileHover={{ scale: 1.04, backgroundColor: "#efe7dc" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          aria-label={favorited
            ? t("storefront.common.removeFromWishlist")
            : t("storefront.common.addToWishlist")}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-300 ${
              favorited ? "fill-[#b5573a] text-[#b5573a]" : "text-[#1c1a18]"
            }`}
          />
        </motion.button>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden translate-y-full [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
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
            className="w-full py-4 bg-[#f7f4ef]/95 hover:bg-[#b5573a] hover:text-white text-[#1c1a18] font-medium text-xs tracking-[1px] uppercase transition-colors duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#1c1a18]/70 disabled:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-4 h-4" />
            {flashUnavailable
              ? t("storefront.sale.flashSoldOut")
              : requiresVariantSelection
                ? t("storefront.sale.selectVariant")
                : t("storefront.common.addToBag")}
          </motion.button>
        </div>
      </div>

      {/* Info details */}
      <div className="pt-4 flex flex-col gap-1.5 px-1">
        {/* Category */}
        <p className="text-[11px] uppercase tracking-[1.5px] text-[#8a857c] font-medium">
          {displayCategory}
        </p>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-serif text-[18px] text-[#1c1a18] font-medium tracking-tight hover:text-[#b5573a] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-sm font-semibold text-[#1c1a18] font-numeric">
            {money(product.price, locale)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[#8a857c] line-through font-numeric">
              {money(product.originalPrice, locale)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
