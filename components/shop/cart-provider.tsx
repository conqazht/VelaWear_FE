"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { getProductVariants } from "@/lib/api/catalog";
import { getMyCart, replaceMyCartItems } from "@/lib/api/commerce";
import type { Cart as ApiCart } from "@/lib/api/types";
import { getActiveLocale, type Locale } from "@/lib/i18n";
import { commonMessages } from "@/lib/i18n/messages/common";
import { resolveImageUrl, type CartItem, type Product } from "@/lib/vela-data";
import { useCartStore } from "@/store/cart-store";

type LocalizedCartCopy = {
  userId: number;
  locale: Locale;
  items: CartItem[];
};

function getPersistableCartItems(cart: CartItem[]) {
  return cart.flatMap((item) =>
    item.variantId === undefined
      ? []
      : [{ variantId: item.variantId, quantity: item.quantity }]
  );
}

function mapServerCartItems(serverCart: ApiCart, locale: Locale): CartItem[] {
  const defaultLabel = commonMessages[locale]["common.default"];

  return (serverCart.items ?? []).map((item) => {
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
      color: item.color ?? defaultLabel,
      size: item.size ?? defaultLabel,
      image: resolveImageUrl(item.image),
      quantity: item.quantity,
      variantId: item.variantId,
    };
  });
}

function indexCartByVariant(cart: CartItem[]) {
  const itemsByVariant = new Map<number, CartItem>();

  cart.forEach((item) => {
    if (item.variantId !== undefined) itemsByVariant.set(item.variantId, item);
  });

  return itemsByVariant;
}

function mergeServerCartWithLatestState(
  serverItems: CartItem[],
  cartAtRequestStart: CartItem[],
  latestCart: CartItem[]
) {
  const initialItemsByVariant = indexCartByVariant(cartAtRequestStart);
  const latestItemsByVariant = indexCartByVariant(latestCart);
  const serverVariantIds = new Set(
    serverItems.flatMap((item) =>
      item.variantId === undefined ? [] : [item.variantId]
    )
  );

  const reconciledServerItems = serverItems.flatMap((serverItem) => {
    if (serverItem.variantId === undefined) return [serverItem];

    const initialItem = initialItemsByVariant.get(serverItem.variantId);
    const latestItem = latestItemsByVariant.get(serverItem.variantId);

    if (initialItem && !latestItem) return [];
    if (
      latestItem &&
      (!initialItem || latestItem.quantity !== initialItem.quantity)
    ) {
      return [{ ...serverItem, quantity: latestItem.quantity }];
    }

    return [serverItem];
  });

  return [
    ...reconciledServerItems,
    ...latestCart.filter(
      (item) =>
        item.variantId === undefined || !serverVariantIds.has(item.variantId)
    ),
  ];
}

function applyLocalizedCartCopy(
  currentCart: CartItem[],
  localizedItems: CartItem[]
) {
  const localizedItemsByVariant = indexCartByVariant(localizedItems);

  return currentCart.map((item) => {
    if (item.variantId === undefined) return item;

    const localizedItem = localizedItemsByVariant.get(item.variantId);
    if (!localizedItem) return item;

    return {
      ...item,
      productId: localizedItem.productId ?? item.productId,
      productSlug: localizedItem.productSlug ?? item.productSlug,
      name: localizedItem.name,
      price: localizedItem.price,
      listPrice: localizedItem.listPrice,
      priceSource: localizedItem.priceSource,
      campaignId: localizedItem.campaignId,
      campaignItemId: localizedItem.campaignItemId,
      campaignCode: localizedItem.campaignCode,
      campaignName: localizedItem.campaignName,
      campaignEndsAt: localizedItem.campaignEndsAt,
      remainingQuota: localizedItem.remainingQuota,
      maxPerCustomer: localizedItem.maxPerCustomer,
      customerRemaining: localizedItem.customerRemaining,
      availableQuantity: localizedItem.availableQuantity,
      color: localizedItem.color,
      size: localizedItem.size,
      image: localizedItem.image,
    };
  });
}

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { locale } = useI18n();
  const storedCart = useCartStore((state) => state.cart);
  const addToLocalCart = useCartStore((state) => state.addToCart);
  const attachVariant = useCartStore((state) => state.attachVariant);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [localizedCartCopy, setLocalizedCartCopy] =
    useState<LocalizedCartCopy | null>(null);
  const syncedUserIdRef = useRef<number | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const userId = user?.id;
  const cartSyncSignature = useMemo(
    () => JSON.stringify(getPersistableCartItems(storedCart)),
    [storedCart]
  );

  const cart = useMemo(() => {
    if (
      !isAuthenticated ||
      userId === undefined ||
      localizedCartCopy?.userId !== userId ||
      localizedCartCopy.locale !== locale
    ) {
      return storedCart;
    }

    return applyLocalizedCartCopy(storedCart, localizedCartCopy.items);
  }, [isAuthenticated, locale, localizedCartCopy, storedCart, userId]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || userId === undefined) return;

    while (true) {
      const requestedLocale = getActiveLocale();
      const serverCart = await getMyCart();
      if (requestedLocale !== getActiveLocale()) continue;

      const serverItems = mapServerCartItems(serverCart, requestedLocale);
      const unresolvedItems = useCartStore
        .getState()
        .cart.filter((item) => item.variantId === undefined);

      setLocalizedCartCopy({
        userId,
        locale: requestedLocale,
        items: serverItems,
      });
      useCartStore.setState({ cart: [...serverItems, ...unresolvedItems] });
      return;
    }
  }, [isAuthenticated, userId]);

  const clearScheduledCartSync = useCallback(() => {
    if (syncTimeoutRef.current === null) return;
    window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = null;
  }, []);

  const scheduleCartSync = useCallback(
    (targetUserId: number) => {
      clearScheduledCartSync();
      syncTimeoutRef.current = window.setTimeout(() => {
        syncTimeoutRef.current = null;
        if (syncedUserIdRef.current !== targetUserId) return;

        const requestedLocale = getActiveLocale();
        const cartAtRequestStart = useCartStore.getState().cart;
        void replaceMyCartItems({
          items: getPersistableCartItems(cartAtRequestStart),
        })
          .then((canonicalCart) => {
            if (
              syncedUserIdRef.current !== targetUserId ||
              requestedLocale !== getActiveLocale()
            ) {
              return;
            }

            const canonicalItems = mapServerCartItems(
              canonicalCart,
              requestedLocale
            );
            setLocalizedCartCopy({
              userId: targetUserId,
              locale: requestedLocale,
              items: canonicalItems,
            });
            useCartStore.setState((state) => ({
              cart: mergeServerCartWithLatestState(
                canonicalItems,
                cartAtRequestStart,
                state.cart
              ),
            }));
          })
          .catch(() => {
            // Checkout remains authoritative; transient cart sync failures are surfaced there.
          });
      }, 250);
    },
    [clearScheduledCartSync]
  );

  const addToCart = useCallback(
    (product: Product, color = product.color, size = product.size) => {
      addToLocalCart(product, color, size);
      if (product.variantId !== undefined || product.realId === undefined) return;

      const localItemId = `${product.id}-${color}-${size}`;
      void getProductVariants({ productId: product.realId, size: 100 }).then(
        (response) => {
          const variant =
            response.result.find(
              (item) =>
                item.color?.name?.toLowerCase() === color.toLowerCase() &&
                item.size?.name?.toLowerCase() === size.toLowerCase()
            ) ?? response.result[0];
          if (variant) attachVariant(localItemId, variant.id);
        }
      );
    },
    [addToLocalCart, attachVariant]
  );

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated || userId === undefined) {
      syncedUserIdRef.current = null;
      clearScheduledCartSync();
      return;
    }

    let cancelled = false;
    const cartAtRequestStart = useCartStore.getState().cart;

    const mergeAuthenticatedCart = async () => {
      try {
        while (!cancelled) {
          const requestedLocale = getActiveLocale();
          const serverCart = await getMyCart();

          if (requestedLocale !== getActiveLocale()) continue;
          if (cancelled) return;

          const serverItems = mapServerCartItems(serverCart, requestedLocale);
          setLocalizedCartCopy({
            userId,
            locale: requestedLocale,
            items: serverItems,
          });
          syncedUserIdRef.current = userId;
          useCartStore.setState((state) => ({
            cart: mergeServerCartWithLatestState(
              serverItems,
              cartAtRequestStart,
              state.cart
            ),
          }));
          scheduleCartSync(userId);
          return;
        }
      } catch {
        if (!cancelled) {
          setLocalizedCartCopy(null);
          syncedUserIdRef.current = userId;
        }
      }
    };

    void mergeAuthenticatedCart();

    return () => {
      cancelled = true;
      clearScheduledCartSync();
    };
  }, [
    clearScheduledCartSync,
    isAuthLoading,
    isAuthenticated,
    scheduleCartSync,
    userId,
  ]);

  useEffect(() => {
    if (
      isAuthLoading ||
      !isAuthenticated ||
      userId === undefined ||
      syncedUserIdRef.current !== userId
    ) {
      return;
    }

    let cancelled = false;
    const requestedLocale = locale;

    void getMyCart()
      .then((serverCart) => {
        if (
          cancelled ||
          requestedLocale !== getActiveLocale() ||
          syncedUserIdRef.current !== userId
        ) {
          return;
        }

        setLocalizedCartCopy({
          userId,
          locale: requestedLocale,
          items: mapServerCartItems(serverCart, requestedLocale),
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, locale, userId]);

  useEffect(() => {
    if (
      isAuthLoading ||
      !isAuthenticated ||
      userId === undefined ||
      syncedUserIdRef.current !== userId
    ) {
      return;
    }

    scheduleCartSync(userId);

    return clearScheduledCartSync;
  }, [
    cartSyncSignature,
    clearScheduledCartSync,
    isAuthLoading,
    isAuthenticated,
    scheduleCartSync,
    userId,
  ]);

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
