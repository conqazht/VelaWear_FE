import { AnimatedStatus } from "@/components/errors/animated-status";

export default function DashboardNotFound() {
  return (
    <AnimatedStatus
      code="404"
      title="This Management page is unavailable"
      description="The address may be outdated, the page may have moved, or this section is not part of the current workspace."
      primaryAction={{ label: "Open Management", href: "/dashboard/users" }}
      secondaryAction={{ label: "Dashboard home", href: "/dashboard/default" }}
      accent="#f7f4ef"
      variant="panel"
    />
  );
}
