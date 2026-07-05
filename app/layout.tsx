import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
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
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <FavoritesProvider>{children}</FavoritesProvider>
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
