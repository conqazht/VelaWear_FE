import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function NotFound() {
  return (
    <StorefrontStatus
      status={404}
      titleKey="errors.rootNotFound.title"
      descriptionKey="errors.rootNotFound.description"
      primaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
      secondaryAction={{ labelKey: "errors.common.home", href: "/" }}
    />
  );
}
