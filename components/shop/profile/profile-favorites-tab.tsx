import Link from "next/link";
import React from "react";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Product } from "@/lib/vela-data";
import { ProfileFavouritesLoading } from "./profile-loading";

interface ProfileFavoritesTabProps {
  favorites: Product[];
  favoritesLoading: boolean;
  favoritesError: unknown;
  retryFavorites: () => void;
  toggleFavorite: (product: Product) => void;
  addToCart: (product: Product) => void;
  showAddedToBag: (product: Product, size: string, color: string) => void;
}

export function ProfileFavoritesTab({
  favorites,
  favoritesLoading,
  favoritesError,
  retryFavorites,
  toggleFavorite,
  addToCart,
  showAddedToBag,
}: ProfileFavoritesTabProps) {
  const { t } = useI18n();

  return (
    <section className="flex flex-col gap-6 text-left">
      <div className="border-b border-hairline pb-4 flex justify-between items-end">
        <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
          {t("account.favourites.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">
          {t(favorites.length === 1 ? "account.favourites.count.one" : "account.favourites.count.many", { count: favorites.length })}
        </span>
      </div>
      {favoritesLoading ? (
        <ProfileFavouritesLoading />
      ) : favoritesError ? (
        <StorefrontApiStatus
          error={favoritesError}
          onRetry={retryFavorites}
          resourceLabel={t("account.favourites.resource")}
          returnHref="/collection"
          variant="panel"
        />
      ) : favorites.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-6">
          <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
            {t("account.favourites.empty")}
          </p>
          <Link
            href="/collection"
            className="inline-flex bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-widest py-3.5 px-8 hover:bg-primary-active transition-colors duration-200 rounded-sm shadow-sm"
          >
            {t("account.favourites.explore")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              imageAction={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(product);
                  }}
                  aria-label={t("account.favourites.remove", { product: product.name })}
                  className="flex items-center justify-center size-8 rounded-full bg-[#1c1a18]/5 hover:scale-110 transition-transform"
                >
                  <Heart className="size-4 text-[#b5573a] fill-[#b5573a]" />
                </button>
              }
              footerAction={
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                    showAddedToBag(product, product.size || "M", product.color || t("account.favourites.defaultOption"));
                  }}
                  className="w-full py-3 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors"
                >
                  {t("account.favourites.addToBag")}
                </button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
