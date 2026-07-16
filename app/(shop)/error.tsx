"use client";

import { useEffect } from "react";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StorefrontStatus
      status={500}
      titleKey="errors.shopError.title"
      descriptionKey="errors.shopError.description"
      primaryAction={{ labelKey: "errors.common.retry", onClick: unstable_retry }}
      secondaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
      reference={error.digest}
      variant="route"
    />
  );
}
