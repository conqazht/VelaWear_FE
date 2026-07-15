"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { CartItem, Product, resolveImageUrl } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import { getMyCart, replaceMyCartItems } from "@/lib/api/commerce";
import { getProductVariants } from "@/lib/api/catalog";
import type { CartApiItem } from "@/lib/api/types";
import { useCartStore } from "@/store/cart-store";

interface CartContextValue {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function mapServerCartItems(items: CartApiItem[] = []): CartItem[] {
  return items.map((item) => {
    const pricing = item.pricing;

    return {
      id: `variant-${item.variantId}`,
      productId: item.productId ?? undefined,
      productSlug: item.productSlug ?? undefined,
      name: item.productName,
      price: Number(item.price ?? pricing?.effectivePrice ?? 0),
      listPrice:
        item.listPrice == null && pricing?.listPrice == null
          ? undefined
          : Number(item.listPrice ?? pricing?.listPrice),
      priceSource: pricing?.priceSource ?? item.priceSource,
      campaignId: pricing?.campaignId ?? item.campaignId ?? undefined,
      campaignItemId:
        pricing?.campaignItemId ?? item.campaignItemId ?? undefined,
      campaignCode: pricing?.campaignCode ?? item.campaignCode ?? undefined,
      campaignName: pricing?.campaignName ?? item.campaignName ?? undefined,
      campaignEndsAt: pricing?.endsAt ?? item.campaignEndsAt ?? undefined,
      remainingQuota:
        pricing?.remainingQuota ?? item.remainingQuota ?? undefined,
      maxPerCustomer:
        pricing?.maxPerCustomer ?? item.maxPerCustomer ?? undefined,
      customerRemaining:
        pricing?.customerRemaining ?? item.customerRemaining ?? undefined,
      availableQuantity:
        pricing?.availableQuantity ?? item.availableQuantity ?? undefined,
      color: item.color ?? "Default",
      size: item.size ?? "Default",
      image: resolveImageUrl(item.image),
      quantity: item.quantity,
      variantId: item.variantId,
    };
  });
}

function cartSignature(items: CartItem[]) {
  return items
    .map((item) => [
      item.variantId ?? item.id,
      item.quantity,
      item.price,
      item.priceSource ?? "BASE",
      item.campaignItemId ?? "",
      item.remainingQuota ?? "",
      item.customerRemaining ?? "",
    ].join(":"))
    .sort()
    .join("|");
}

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

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const serverCart = await getMyCart();
    const unresolvedItems = useCartStore
      .getState()
      .cart.filter((item) => item.variantId === undefined);
    setCart([...mapServerCartItems(serverCart.items), ...unresolvedItems]);
  }, [isAuthenticated, setCart, user]);

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
        const serverItems = mapServerCartItems(serverCart.items);
        const serverVariantIds = new Set(serverItems.map((item) => item.variantId));
        const mergedCart = [
          ...serverItems,
          ...guestCart.filter(
            (item) => item.variantId === undefined || !serverVariantIds.has(item.variantId)
          ),
        ];

        const canonicalCart = await replaceMyCartItems({
          items: mergedCart
            .filter((item): item is CartItem & { variantId: number } => item.variantId !== undefined)
            .map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        });

        if (!cancelled) {
          const unresolvedItems = mergedCart.filter((item) => item.variantId === undefined);
          syncedUserIdRef.current = user.id;
          setCart([...mapServerCartItems(canonicalCart.items), ...unresolvedItems]);
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
      }).then((canonicalCart) => {
        const canonicalItems = mapServerCartItems(canonicalCart.items);
        const unresolvedItems = useCartStore
          .getState()
          .cart.filter((item) => item.variantId === undefined);
        const nextCart = [...canonicalItems, ...unresolvedItems];

        if (cartSignature(nextCart) !== cartSignature(useCartStore.getState().cart)) {
          setCart(nextCart);
        }
      }).catch(() => {
        // Checkout remains authoritative; transient cart sync failures are surfaced there.
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [cart, setCart, user]);

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
      refreshCart,
    };
  }, [addToCart, cart, clearCart, refreshCart, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
