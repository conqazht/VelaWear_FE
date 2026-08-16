"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  useCreateWishlistMutation,
  useDeleteWishlistMutation,
  useWishlistsQuery,
} from "@/lib/queries/commerce";
import { mapBackendProduct, Product } from "@/lib/vela-data";
import { useNotification } from "./notification-provider";

interface FavoritesContextValue {
  favorites: Product[];
  isLoading: boolean;
  error: unknown | null;
  retry: () => void;
  addToFavorites: (product: Product, size?: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product, size?: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const accountKey = isAuthenticated && user ? `user-${user.id}` : "anonymous";

  return <AccountFavoritesProvider key={accountKey}>{children}</AccountFavoritesProvider>;
}

function AccountFavoritesProvider({ children }: { children: React.ReactNode }) {
  const [optimisticFavorites, setOptimisticFavorites] = useState<Product[]>([]);
  const [optimisticRemovedProductIds, setOptimisticRemovedProductIds] = useState<Set<number>>(
    new Set(),
  );
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { showAddedToFavorites } = useNotification();
  const { locale: activeLocale } = useI18n();
  const wishlistUserId = isAuthenticated ? user?.id : undefined;
  const wishlistsQuery = useWishlistsQuery(
    wishlistUserId,
    { size: 100 },
    isAuthenticated,
    activeLocale,
  );
  const createWishlistMutation = useCreateWishlistMutation();
  const deleteWishlistMutation = useDeleteWishlistMutation();

  const serverWishlists = useMemo(
    () => wishlistsQuery.data?.result ?? [],
    [wishlistsQuery.data?.result],
  );

  const isLoading = isAuthLoading || (isAuthenticated && wishlistsQuery.isLoading);

  const error = wishlistsQuery.error ?? null;

  const retry = useCallback(() => {
    void wishlistsQuery.refetch();
  }, [wishlistsQuery]);

  const serverFavorites = useMemo(() => {
    return serverWishlists
      .filter((item) => item.product && !optimisticRemovedProductIds.has(item.productId))
      .map((item) => mapBackendProduct(item.product, activeLocale));
  }, [activeLocale, optimisticRemovedProductIds, serverWishlists]);

  const favorites = useMemo(() => {
    const serverIds = new Set(serverFavorites.map((item) => item.realId ?? item.id));
    const pendingFavorites = optimisticFavorites.filter(
      (item) => !serverIds.has(item.realId ?? item.id),
    );

    return [...serverFavorites, ...pendingFavorites];
  }, [optimisticFavorites, serverFavorites]);

  const isFavorite = useCallback(
    (productId: string) => {
      return favorites.some((item) => item.id === productId);
    },
    [favorites],
  );

  const isFavoriteProduct = useCallback(
    (product: Product) => {
      if (product.realId !== undefined) {
        return favorites.some((item) => item.realId === product.realId || item.id === product.id);
      }

      return favorites.some((item) => item.id === product.id);
    },
    [favorites],
  );

  const addToFavorites = useCallback(
    (product: Product, size = "M") => {
      if (!isAuthenticated || !user) {
        router.push("/sign-in");
        return;
      }

      if (product.realId === undefined) return;

      if (serverWishlists.some((item) => item.productId === product.realId)) {
        showAddedToFavorites(product, size);
        return;
      }

      setOptimisticFavorites((prev) => {
        if (prev.some((item) => item.id === product.id)) return prev;
        return [...prev, product];
      });
      setOptimisticRemovedProductIds((prev) => {
        const next = new Set(prev);
        if (product.realId !== undefined) {
          next.delete(product.realId);
        }
        return next;
      });
      createWishlistMutation.mutate(product.realId!, {
        onSuccess: () => {
          showAddedToFavorites(product, size);
        },
        onError: () => {
          setOptimisticFavorites((prev) => prev.filter((item) => item.id !== product.id));
        },
      });
    },
    [createWishlistMutation, isAuthenticated, router, serverWishlists, showAddedToFavorites, user],
  );

  const removeFromFavorites = useCallback(
    (productId: string) => {
      const product = favorites.find((item) => item.id === productId);
      const wishlist = serverWishlists.find(
        (item) => product?.realId !== undefined && item.productId === product.realId,
      );

      setOptimisticFavorites((prev) => prev.filter((item) => item.id !== productId));
      if (product?.realId !== undefined) {
        setOptimisticRemovedProductIds((prev) => new Set(prev).add(product.realId!));
      }
      if (wishlist && product?.realId !== undefined) {
        deleteWishlistMutation.mutate(product.realId!, {
          onError: () => {
            if (product?.realId !== undefined) {
              setOptimisticRemovedProductIds((prev) => {
                const next = new Set(prev);
                next.delete(product.realId!);
                return next;
              });
            }
          },
        });
      }
    },
    [deleteWishlistMutation, favorites, serverWishlists],
  );

  const removeProductFromFavorites = useCallback(
    (product: Product) => {
      const matchedProduct = favorites.find(
        (item) =>
          item.id === product.id ||
          (product.realId !== undefined && item.realId === product.realId),
      );
      const realId = product.realId ?? matchedProduct?.realId;
      const wishlist = serverWishlists.find(
        (item) => realId !== undefined && item.productId === realId,
      );

      setOptimisticFavorites((prev) =>
        prev.filter(
          (item) => item.id !== product.id && (realId === undefined || item.realId !== realId),
        ),
      );
      if (realId !== undefined) {
        setOptimisticRemovedProductIds((prev) => new Set(prev).add(realId));
      }
      if (wishlist && realId !== undefined) {
        deleteWishlistMutation.mutate(realId, {
          onError: () => {
            if (realId !== undefined) {
              setOptimisticRemovedProductIds((prev) => {
                const next = new Set(prev);
                next.delete(realId);
                return next;
              });
            }
          },
        });
      }
    },
    [deleteWishlistMutation, favorites, serverWishlists],
  );

  const toggleFavorite = useCallback(
    (product: Product, size = "M") => {
      if (isFavoriteProduct(product)) {
        removeProductFromFavorites(product);
      } else {
        addToFavorites(product, size);
      }
    },
    [isFavoriteProduct, addToFavorites, removeProductFromFavorites],
  );

  const value = useMemo(
    () => ({
      favorites,
      isLoading,
      error,
      retry,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
    }),
    [
      favorites,
      isLoading,
      error,
      retry,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
    ],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
