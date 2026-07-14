import { AnimatedStatus } from "@/components/errors/animated-status";

export default function NotFound() {
  return (
    <AnimatedStatus
      code="404"
      title="This page slipped out of view"
      description="The address may be outdated, the page may have moved, or the link may never have existed."
      primaryAction={{ label: "Return home", href: "/" }}
      secondaryAction={{ label: "Browse collection", href: "/collection" }}
      accent="#f7f4ef"
    />
  );
}
