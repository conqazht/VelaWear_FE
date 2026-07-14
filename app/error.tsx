"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <AnimatedStatus
      code="500"
      title="The experience needs a quick reset"
      description="An unexpected server error interrupted this page. Try the request again, or return home while we recover."
      primaryAction={{ label: "Try again", onClick: unstable_retry }}
      secondaryAction={{ label: "Return home", href: "/" }}
      accent="#ff8f78"
      reference={error.digest}
    />
  );
}
