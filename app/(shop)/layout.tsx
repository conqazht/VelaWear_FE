import {
  CachedSiteFooter,
  CachedSiteHeader,
} from "@/components/shop/cached-shop-chrome";
import { ShopProviders } from "@/components/shop/shop-providers";
import { SkipToContent } from "@/components/shop/skip-to-content";
import { I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nCatalogProvider messages={shopMessages}>
      <ShopProviders>
        <SkipToContent />
        <CachedSiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <CachedSiteFooter />
      </ShopProviders>
    </I18nCatalogProvider>
  );
}
