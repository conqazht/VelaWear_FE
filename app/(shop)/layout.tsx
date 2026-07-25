import {
  CachedSiteFooter,
  CachedSiteHeader,
} from "@/components/shop/cached-shop-chrome";
import { ShopProviders } from "@/components/shop/shop-providers";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ShopProviders>
      <CachedSiteHeader />
      <main className="flex-1">{children}</main>
      <CachedSiteFooter />
    </ShopProviders>
  );
}
