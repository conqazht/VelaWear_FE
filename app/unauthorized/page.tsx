import type { Metadata } from "next";

import { StorefrontStatus } from "@/components/errors/storefront-status";

export const metadata: Metadata = {
  title: "403 — Vela Wear",
};

export default function ForbiddenPage() {
  return (
    <StorefrontStatus
      status={403}
      titleKey="errors.unauthorized.title"
      descriptionKey="errors.unauthorized.description"
      primaryAction={{ labelKey: "errors.common.home", href: "/" }}
      secondaryAction={{ labelKey: "errors.common.collection", href: "/collection" }}
    />
  );
}
