import { cacheLife } from "next/cache";

import { CollectionPage } from "@/components/shop/collection-page";

export default async function Page() {
  "use cache";
  cacheLife("max");

  return <CollectionPage />;
}
