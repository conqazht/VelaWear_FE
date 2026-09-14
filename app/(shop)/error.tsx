"use client";

import { useEffect } from "react";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const retry = reset ?? unstable_retry ?? (() => window.location.reload());

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="contents">
      <button type="button" onClick={reset ?? retry} className="sr-only">
        Retry
      </button>
      <StorefrontStatus
        status={500}
        titleKey="errors.shopError.title"
        descriptionKey="errors.shopError.description"
        primaryAction={{ labelKey: "errors.common.retry", onClick: retry }}
        secondaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
        reference={error.digest}
        variant="route"
      />
    </div>
  );
}
