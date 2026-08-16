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
      <div className="border-hairline flex items-end justify-between border-b pb-4">
        <h2 className="text-ink font-serif text-2xl font-light tracking-tight md:text-3xl">
          {t("account.favourites.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">
          {t(
            favorites.length === 1
              ? "account.favourites.count.one"
              : "account.favourites.count.many",
            { count: favorites.length },
          )}
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
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <p className="text-on-surface-variant/80 max-w-md text-sm font-light">
            {t("account.favourites.empty")}
          </p>
          <Link
            href="/collection"
            className="bg-primary-container text-on-primary hover:bg-primary-active inline-flex rounded-sm px-8 py-3.5 text-xs font-semibold tracking-widest uppercase shadow-sm transition-colors duration-200"
          >
            {t("account.favourites.explore")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  className="flex size-8 items-center justify-center rounded-full bg-[#1c1a18]/5 transition-transform hover:scale-110"
                >
                  <Heart className="size-4 fill-[#b5573a] text-[#b5573a]" />
                </button>
              }
              footerAction={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                    showAddedToBag(
                      product,
                      product.size || "M",
                      product.color || t("account.favourites.defaultOption"),
                    );
                  }}
                  className="w-full rounded-sm border border-[#1c1a18] py-3 text-xs font-semibold tracking-widest text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18] hover:text-white"
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
