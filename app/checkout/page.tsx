import { cacheLife } from "next/cache";

import { CheckoutPageClient } from "@/components/shop/checkout-page-client";

export default async function Page() {
  "use cache";
  cacheLife("max");

  return <CheckoutPageClient />;
}
