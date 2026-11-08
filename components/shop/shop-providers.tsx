"use client";

import { ReactNode } from "react";
import { CartProvider } from "./cart-provider";
import { NotificationProvider } from "./notification-provider";
import { FavoritesProvider } from "./favorites-provider";
import { RecentlyViewedDock } from "./recently-viewed-dock";

export function ShopProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <NotificationProvider>
        <FavoritesProvider>
          {children}
          <RecentlyViewedDock />
        </FavoritesProvider>
      </NotificationProvider>
    </CartProvider>
  );
}
