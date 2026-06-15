import { cacheLife } from "next/cache";

import { CartPageClient } from "@/components/shop/cart-page-client";

export default async function Page() {
  "use cache";
  cacheLife("max");

  return <CartPageClient />;
}
