"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { money, Product } from "@/lib/vela-data";
import { ProductCard } from "@/components/shop/product-card";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  const handleAddToBag = (product: Product) => {
    addToCart(product);
    showAddedToBag(product, product.size || "M", product.color || "Sand");
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-16">
      {/* Breadcrumbs */}
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[80vh]">
          {favorites.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col relative bg-white hover:shadow-lg transition-shadow duration-300 rounded-sm overflow-hidden border border-[#1c1a18]/5"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#dfd9d5]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={() => removeFromFavorites(product.id)}
                  aria-label="Remove from favorites"
                  className="absolute top-4 right-4 bg-white p-2 hover:bg-[#efebe4] transition-colors z-10 text-primary border border-hairline/20 rounded-none shadow-sm"
                >
                  <Heart className="size-4 fill-[#964025] stroke-[#964025]" />
                </button>
              </div>

              {/* Product Details */}
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
      )}
    </div>
  );
}
