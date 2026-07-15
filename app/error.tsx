"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <StorefrontStatus
      status={500}
      titleKey="errors.rootError.title"
      descriptionKey="errors.rootError.description"
      primaryAction={{ labelKey: "errors.common.retry", onClick: unstable_retry }}
      secondaryAction={{ labelKey: "errors.common.home", href: "/" }}
      reference={error.digest}
    />
  );
}
