import {
  CachedSiteFooter,
  CachedSiteHeader,
} from "@/components/shop/cached-shop-chrome";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CachedSiteHeader />
      <main className="flex-1">{children}</main>
      <CachedSiteFooter />
    </>
  );
}
