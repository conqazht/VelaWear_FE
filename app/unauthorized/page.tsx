import type { Metadata } from "next";

import { AnimatedStatus } from "@/components/errors/animated-status";

export const metadata: Metadata = {
  title: "403 — Access denied | Vela Wear",
};

export default function ForbiddenPage() {
  return (
    <AnimatedStatus
      code="403"
      title="This area is not in your collection"
      description="Your account is signed in, but it does not have permission to open this workspace or resource."
      primaryAction={{ label: "Return home", href: "/" }}
      secondaryAction={{ label: "Open dashboard", href: "/dashboard/default" }}
      accent="#ffb59f"
    />
  );
}
