"use client";

import Link from "next/link";
import { Skeleton } from "boneyard-js/react";
import { Heart, LockKeyhole, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { FashionImage } from "@/components/shop/fashion-image";
import { money, Product, PRODUCTS } from "@/lib/vela-data";

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
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] animate-pulse bg-[#efe7dc]" />
            <div className="h-4 w-3/4 animate-pulse bg-[#efe7dc]" />
            <div className="h-4 w-1/3 animate-pulse bg-[#efe7dc]" />
          </div>
        ))}
      </div>
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
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      <div className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">Favorites</span>
      </div>

      <header className="mb-12">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
          Favorites
        </h1>
        {favorites.length > 0 && (
          <p className="block text-xs uppercase tracking-widest text-[#1c1a18]/60 mt-2">
            {favorites.length} designs saved in your wishlist
          </p>
        )}
      </header>

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
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[80vh]">
      {products.map((product) => (
        <article
          key={product.id}
          className="group flex flex-col relative bg-white hover:shadow-lg transition-shadow duration-300 rounded-sm overflow-hidden border border-[#1c1a18]/5"
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#dfd9d5]">
            <FashionImage src={product.image} alt={product.name} />
            <button
              onClick={() => removeFromFavorites(product.id)}
              aria-label="Remove from favorites"
              className="absolute top-4 right-4 bg-white p-2 hover:bg-[#efebe4] transition-colors z-10 text-primary border border-hairline/20 rounded-none shadow-sm"
            >
              <Heart className="size-4 fill-[#964025] stroke-[#964025]" />
            </button>
          </div>

          <div className="p-6 flex flex-col flex-grow justify-between">
            <div>
              <div className="flex justify-between items-start mb-2 gap-4">
                <h2 className="font-serif text-lg font-semibold text-[#1c1a18]">
                  {product.name}
                </h2>
                <span className="font-serif text-base font-light text-[#1c1a18] whitespace-nowrap">
                  {money(product.price)}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#1c1a18]/60 uppercase tracking-widest mb-6">
                {product.category === "AO"
                  ? "Áo"
                  : product.category === "QUAN"
                  ? "Quần"
                  : "Phụ kiện"}
              </p>
            </div>

            <button
              onClick={() => handleAddToBag(product)}
              className="w-full bg-[#f3ede9] border border-[#e3dccf] py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] hover:bg-[#b5573a] hover:text-white hover:border-[#b5573a] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-4" />
              <span>Add to Bag</span>
            </button>
          </div>
        </article>
      ))}
    </div>
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
