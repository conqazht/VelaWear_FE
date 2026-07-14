"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <AnimatedStatus
      code="500"
      title="The Management workspace needs a reset"
      description="An unexpected error interrupted this admin page. Retry the request or return to Management while the workspace recovers."
      primaryAction={{ label: "Try again", onClick: unstable_retry }}
      secondaryAction={{ label: "Open Management", href: "/dashboard/users" }}
      accent="#ff8f78"
      reference={error.digest}
      variant="panel"
    />
  );
}
