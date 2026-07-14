"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <title>500 — Vela Wear</title>
        <AnimatedStatus
          code="500"
          title="Vela Wear needs a moment"
          description="A critical error interrupted the application. Retry the experience, or return to the storefront."
          primaryAction={{ label: "Try again", onClick: unstable_retry }}
          secondaryAction={{ label: "Return home", href: "/" }}
          accent="#ff8f78"
          reference={error.digest}
        />
      </body>
    </html>
  );
}
