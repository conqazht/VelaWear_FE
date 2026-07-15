import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-[104px] md:pt-[120px] lg:px-10">
      <StorefrontStatus
        status={404}
        titleKey="errors.shopNotFound.title"
        descriptionKey="errors.shopNotFound.description"
        primaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
        secondaryAction={{ labelKey: "errors.common.home", href: "/" }}
        variant="panel"
      />
    </div>
  );
}
