import type { Metadata } from "next";
import React from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BoneyardRegistry } from "@/components/providers/boneyard-registry";
import { QueryProvider } from "@/components/providers/query-provider";
import { CartProvider } from "@/components/shop/cart-provider";
import { NotificationProvider } from "@/components/shop/notification-provider";
import { FavoritesProvider } from "@/components/shop/favorites-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELA WEAR",
  description: "Editorial fashion commerce experience for VELA WEAR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <BoneyardRegistry />
        <React.Suspense fallback={null}>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <NotificationProvider>
                  <FavoritesProvider>{children}</FavoritesProvider>
                </NotificationProvider>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </React.Suspense>
      </body>
    </html>
  );
}
