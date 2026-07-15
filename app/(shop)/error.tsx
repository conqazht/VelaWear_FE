"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-[104px] md:pt-[120px] lg:px-10">
      <StorefrontStatus
        status={500}
        titleKey="errors.shopError.title"
        descriptionKey="errors.shopError.description"
        primaryAction={{ labelKey: "errors.common.retry", onClick: unstable_retry }}
        secondaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
        reference={error.digest}
        variant="panel"
      />
    </div>
  );
}
