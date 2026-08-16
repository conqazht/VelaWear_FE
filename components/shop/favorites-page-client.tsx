"use client";

import Link from "next/link";
import { Heart, LockKeyhole, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-layout-components";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/lib/vela-data";
import { useI18n } from "@/components/providers/i18n-provider";

export function FavoritesPageClient() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    favorites,
    isLoading: isFavoritesLoading,
    error,
    retry,
    removeFromFavorites,
  } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  const handleAddToBag = (product: Product) => {
    addToCart(product);
    showAddedToBag(product, product.size || "M", product.color || "Sand");
  };

  if (isAuthLoading || isFavoritesLoading) {
    return <FavoritesPageLoadingFallback loadingLabel={t("common.loading")} />;
  }

  return (
    <>
      {!isAuthenticated ? (
        <FavoritesSignInState />
      ) : error && favorites.length === 0 ? (
        <StorefrontApiStatus
          error={error}
          onRetry={retry}
          resourceLabel={t("favorites.resource")}
          returnHref="/collection"
          variant="route"
        />
      ) : (
        <>
          {error ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] md:px-16 md:pt-[120px]">
              <StorefrontStaleWarning resourceLabel={t("favorites.resource")} onRetry={retry} error={error} />
            </div>
          ) : null}
          <FavoritesContent
            favorites={favorites}
            removeFromFavorites={removeFromFavorites}
            handleAddToBag={handleAddToBag}
          />
        </>
      )}
    </>
  );
}
function FavoritesPageLoadingFallback({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div
      className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        {loadingLabel}
      </span>

      <div aria-hidden="true">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-2.5 w-12 rounded-none bg-[#efe7dc]" />
          <Skeleton className="h-2.5 w-2 rounded-none bg-[#efe7dc]" />
          <Skeleton className="h-2.5 w-20 rounded-none bg-[#efe7dc]" />
        </div>

        <div className="mb-4 space-y-2">
          <Skeleton className="h-12 w-52 rounded-none bg-[#efe7dc] md:h-14 md:w-64" />
          <Skeleton className="h-2.5 w-28 rounded-none bg-[#efe7dc]" />
        </div>

        <ProductGrid>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-col overflow-hidden rounded-md border border-transparent bg-white"
            >
              <div className="relative aspect-square">
                <Skeleton className="size-full rounded-none bg-[#efe7dc]" />
                <Skeleton className="absolute right-4 top-4 size-10 rounded-full bg-white/85" />
              </div>

              <div className="flex flex-grow flex-col items-start px-4 pb-6 pt-5">
                <Skeleton className="mb-2 h-3 w-2/5 rounded-none bg-[#efe7dc]" />
                <Skeleton className="mb-3 h-5 w-4/5 rounded-none bg-[#efe7dc]" />
                <div className="mt-1 flex items-center gap-2.5">
                  <Skeleton className="h-4 w-20 rounded-none bg-[#efe7dc]" />
                  <Skeleton className="h-3 w-16 rounded-none bg-[#efe7dc]" />
                </div>
                <Skeleton className="mt-5 h-11 w-full rounded-full bg-[#efe7dc]" />
              </div>
            </div>
          ))}
        </ProductGrid>
      </div>
    </div>
  );
}

function FavoritesSignInState() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 py-24">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
        <LockKeyhole className="mb-6 size-12 text-[#b5573a]" />
        <h1 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
          {t("favorites.signInTitle")}
        </h1>
        <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
          {t("favorites.signInDescription")}
        </p>
        <Link
          href="/sign-in"
          className="inline-flex w-full justify-center rounded-full bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#b5573a] active:scale-[0.96]"
        >
          {t("favorites.signIn")}
        </Link>
      </div>
    </div>
  );
}

interface FavoritesContentProps {
  favorites: Product[];
  removeFromFavorites: (productId: string) => void;
  handleAddToBag: (product: Product) => void;
}

function FavoritesContent({
  favorites,
  removeFromFavorites,
  handleAddToBag,
}: FavoritesContentProps) {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      <div className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">{t("favorites.title")}</span>
      </div>

      <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
            {t("favorites.title")}
          </h1>
          {favorites.length > 0 && (
            <p className="block text-xs uppercase tracking-widest text-[#1c1a18]/60 mt-2">
              {t("favorites.savedCount", { count: favorites.length })}
            </p>
          )}
        </div>
        <Link
          href="/collection"
          className="text-xs font-semibold uppercase tracking-wider text-[#b5573a] hover:underline animate-none"
        >
          ← {t("cart.continueShopping")}
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="mx-auto max-w-md pb-12 text-center select-none min-h-[50vh] flex flex-col justify-start pt-16 items-center">
          <Heart className="mx-auto mb-6 size-16 text-[#1c1a18]/20 stroke-[1.2]" />
          <p className="mb-8 text-sm leading-relaxed text-[#1c1a18]/60 max-w-xs">
            {t("favorites.emptyDescription")}
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-full bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#b5573a] active:scale-[0.96]"
          >
            {t("favorites.explore")}
          </Link>
        </div>
      ) : (
        <FavoritesGrid
          products={favorites}
          removeFromFavorites={removeFromFavorites}
          handleAddToBag={handleAddToBag}
        />
      )}
    </div>
  );
}

function FavoritesGrid({
  products,
  removeFromFavorites,
  handleAddToBag,
}: {
  products: Product[];
  removeFromFavorites: (productId: string) => void;
  handleAddToBag: (product: Product) => void;
}) {
  const { t } = useI18n();

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          imageAspect="collection"
          imageAction={
            <button
              onClick={() => removeFromFavorites(product.id)}
              aria-label={t("favorites.remove", { product: product.name })}
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#1c1a18]/10 bg-white/95 text-[#b5573a] shadow-sm transition-colors hover:bg-[#efe7dc]"
            >
              <Heart className="size-4 fill-current stroke-current" />
            </button>
          }
          footerAction={
            <button
              onClick={() => handleAddToBag(product)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e3dccf] bg-[#efe7dc] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] transition-all hover:border-[#b5573a] hover:bg-[#b5573a] hover:text-white active:scale-[0.96]"
            >
              <ShoppingBag className="size-4" />
              <span>{t("favorites.addToBag")}</span>
            </button>
          }
        />
      ))}
    </ProductGrid>
  );
}
