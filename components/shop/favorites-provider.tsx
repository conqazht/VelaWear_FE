"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useCreateWishlistMutation,
  useDeleteWishlistMutation,
  useWishlistsQuery,
} from "@/lib/queries/commerce";
import { Product } from "@/lib/vela-data";
import { useNotification } from "./notification-provider";

interface FavoritesContextValue {
  favorites: Product[];
  addToFavorites: (product: Product, size?: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product, size?: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { showAddedToFavorites } = useNotification();
  const wishlistsQuery = useWishlistsQuery(
    user ? { userId: user.id, size: 100 } : {}
  );
  const createWishlistMutation = useCreateWishlistMutation();
  const deleteWishlistMutation = useDeleteWishlistMutation();

  const serverWishlists = useMemo(
    () => wishlistsQuery.data?.result ?? [],
    [wishlistsQuery.data?.result]
  );

  const isFavorite = useCallback((productId: string) => {
    const localMatch = favorites.some((item) => item.id === productId);
    const product = favorites.find((item) => item.id === productId);
    const serverMatch =
      product?.realId !== undefined
        ? serverWishlists.some((item) => item.productId === product.realId)
        : false;

    return localMatch || serverMatch;
  }, [favorites, serverWishlists]);

  const addToFavorites = useCallback((product: Product, size = "M") => {
    if (!isAuthenticated || !user) {
      router.push("/sign-in");
      return;
    }

    if (product.realId === undefined) return;

    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
    createWishlistMutation.mutate({
      userId: user.id,
      productId: product.realId,
    });
    showAddedToFavorites(product, size);
  }, [createWishlistMutation, isAuthenticated, router, showAddedToFavorites, user]);

  const removeFromFavorites = useCallback((productId: string) => {
    const product = favorites.find((item) => item.id === productId);
    const wishlist = serverWishlists.find(
      (item) => product?.realId !== undefined && item.productId === product.realId
    );

    setFavorites((prev) => prev.filter((item) => item.id !== productId));
    if (wishlist) {
      deleteWishlistMutation.mutate(wishlist.id);
    }
  }, [deleteWishlistMutation, favorites, serverWishlists]);

  const toggleFavorite = useCallback((product: Product, size = "M") => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product, size);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const value = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
