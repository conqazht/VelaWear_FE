import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopNotFound() {
  return (
    <StorefrontStatus
      status={404}
      titleKey="errors.shopNotFound.title"
      descriptionKey="errors.shopNotFound.description"
      primaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
      secondaryAction={{ labelKey: "errors.common.home", href: "/" }}
      variant="route"
    />
  );
}
