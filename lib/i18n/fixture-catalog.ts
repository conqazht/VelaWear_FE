import type { Locale } from "@/lib/i18n";
import { localizeFixtureProduct } from "@/lib/i18n/fixture-products";
import { PRODUCTS, type Product } from "@/lib/vela-data";

export function getLocalizedFixtureProducts(locale: Locale): Product[] {
  return PRODUCTS.map((product) => localizeFixtureProduct(product, locale));
}
