"use client";

import Link from "next/link";
import { Skeleton } from "boneyard-js/react";
import { Heart, LockKeyhole, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-layout-components";
import { ProductCardSkeletonGrid } from "@/components/shop/product-skeletons";
import { Product, PRODUCTS } from "@/lib/vela-data";

export function FavoritesPageClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  const handleAddToBag = (product: Product) => {
    addToCart(product);
    showAddedToBag(product, product.size || "M", product.color || "Sand");
  };

  return (
    <Skeleton
      name="favorites-page"
      loading={isLoading}
      fallback={<FavoritesPageLoadingFallback />}
      fixture={<FavoritesPageFixture />}
    >
      {!isAuthenticated ? (
        <FavoritesSignInState />
      ) : (
        <FavoritesContent
          favorites={favorites}
          removeFromFavorites={removeFromFavorites}
          handleAddToBag={handleAddToBag}
        />
      )}
    </Skeleton>
  );
}

function FavoritesPageLoadingFallback() {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]">
      <div className="h-8 w-56 animate-pulse bg-[#efe7dc]" />
      <ProductCardSkeletonGrid count={6} imageAspect="collection" gridClassName="mt-10" />
    </div>
  );
}

function FavoritesSignInState() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 py-24">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-sm border border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
        <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
        <h1 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
          Đăng nhập để xem yêu thích
        </h1>
        <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
          Danh sách yêu thích được lưu theo tài khoản, nên bạn cần đăng nhập
          trước khi lưu hoặc xem sản phẩm yêu thích.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
        >
          Đăng nhập ngay
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
  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px] min-h-[calc(100vh-200px)]">
      <div className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">Favorites</span>
      </div>

      <div className="mb-4">
        <h1 className="mb-1 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
          Favorites
        </h1>
        {favorites.length > 0 && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50 mt-1">
            {favorites.length} designs saved in your wishlist
          </p>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="mx-auto max-w-md pb-12 text-center select-none min-h-[80vh] flex flex-col justify-start pt-24 items-center">
          <Heart className="mx-auto mb-6 size-16 text-[#1c1a18]/20 stroke-[1.2]" />
          <p className="mb-8 text-sm leading-relaxed text-[#1c1a18]/60 max-w-xs">
            Danh sách yêu thích của bạn đang trống. Hãy lưu lại những sản phẩm bạn yêu thích để dễ dàng theo dõi và đặt mua sau nhé.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b5573a]"
          >
            Khám phá bộ sưu tập
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
              aria-label="Remove from favorites"
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#1c1a18]/10 bg-white/95 text-[#964025] shadow-sm transition-colors hover:bg-[#efebe4]"
            >
              <Heart className="size-4 fill-current stroke-current" />
            </button>
          }
          footerAction={
            <button
              onClick={() => handleAddToBag(product)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e3dccf] bg-[#f3ede9] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] transition-all hover:border-[#b5573a] hover:bg-[#b5573a] hover:text-white"
            >
              <ShoppingBag className="size-4" />
              <span>Add to Bag</span>
            </button>
          }
        />
      ))}
    </ProductGrid>
  );
}

function FavoritesPageFixture() {
  return (
    <FavoritesContent
      favorites={PRODUCTS.slice(0, 4)}
      removeFromFavorites={() => undefined}
      handleAddToBag={() => undefined}
    />
  );
}
