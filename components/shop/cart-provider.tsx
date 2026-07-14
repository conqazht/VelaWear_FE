"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { CartItem, Product, resolveImageUrl } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import { getMyCart, replaceMyCartItems } from "@/lib/api/commerce";
import { getProductVariants } from "@/lib/api/catalog";
import { useCartStore } from "@/store/cart-store";

interface CartContextValue {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const addToLocalCart = useCartStore((state) => state.addToCart);
  const attachVariant = useCartStore((state) => state.attachVariant);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const syncedUserIdRef = useRef<number | null>(null);

  const addToCart = useCallback((product: Product, color = product.color, size = product.size) => {
    addToLocalCart(product, color, size);
    if (product.variantId !== undefined || product.realId === undefined) return;

    const localItemId = `${product.id}-${color}-${size}`;
    void getProductVariants({ productId: product.realId, size: 100 })
      .then((response) => {
        const variant = response.result.find(
          (item) =>
            item.color?.name?.toLowerCase() === color.toLowerCase() &&
            item.size?.name?.toLowerCase() === size.toLowerCase()
        ) ?? response.result[0];
        if (variant) attachVariant(localItemId, variant.id);
      });
  }, [addToLocalCart, attachVariant]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated || !user) {
      syncedUserIdRef.current = null;
      return;
    }

    let cancelled = false;
    const guestCart = useCartStore.getState().cart;

    void getMyCart()
      .then(async (serverCart) => {
        const serverItems: CartItem[] = (serverCart.items ?? []).map((item) => ({
          id: `variant-${item.variantId}`,
          productId: item.productId ?? undefined,
          productSlug: item.productSlug ?? undefined,
          name: item.productName,
          price: Number(item.price ?? 0),
          color: item.color ?? "Default",
          size: item.size ?? "Default",
          image: resolveImageUrl(item.image),
          quantity: item.quantity,
          variantId: item.variantId,
        }));
        const serverVariantIds = new Set(serverItems.map((item) => item.variantId));
        const mergedCart = [
          ...serverItems,
          ...guestCart.filter(
            (item) => item.variantId === undefined || !serverVariantIds.has(item.variantId)
          ),
        ];

        await replaceMyCartItems({
          items: mergedCart
            .filter((item): item is CartItem & { variantId: number } => item.variantId !== undefined)
            .map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        });

        if (!cancelled) {
          syncedUserIdRef.current = user.id;
          setCart(mergedCart);
        }
      })
      .catch(() => {
        if (!cancelled) syncedUserIdRef.current = user.id;
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, setCart, user]);

  useEffect(() => {
    if (!user || syncedUserIdRef.current !== user.id) return;

    const timeoutId = window.setTimeout(() => {
      void replaceMyCartItems({
        items: cart
          .filter((item): item is CartItem & { variantId: number } => item.variantId !== undefined)
          .map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [cart, user]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      cart,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [addToCart, cart, clearCart, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
