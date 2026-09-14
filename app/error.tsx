"use client";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ErrorPage({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const handleRetry = reset ?? unstable_retry ?? (() => window.location.reload());

  return (
    <div role="alert">
      <StorefrontStatus
        status={500}
        titleKey="errors.rootError.title"
        descriptionKey="errors.rootError.description"
        primaryAction={{ labelKey: "errors.common.retry", onClick: handleRetry }}
        secondaryAction={{ labelKey: "errors.common.home", href: "/" }}
        reference={error.digest}
      />
      {handleRetry && (
        <button type="button" onClick={handleRetry} className="sr-only">
          Retry
        </button>
      )}
    </div>
  );
}

