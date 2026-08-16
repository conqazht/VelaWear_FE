"use client";

import { ReactNode } from "react";
import { CartProvider } from "./cart-provider";
import { NotificationProvider } from "./notification-provider";
import { FavoritesProvider } from "./favorites-provider";

export function ShopProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <NotificationProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </NotificationProvider>
    </CartProvider>
  );
}
