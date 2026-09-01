import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AdminStatusBadge,
  type AdminStatusVariant,
  getStatusBadgeVariant,
  getHttpMethodVariant,
  getRoleBadgeVariant,
} from "@/app/(admin)/dashboard/_components/admin-status-badge";

describe("AdminStatusBadge", () => {
  it("renders with default neutral variant and text content", () => {
    const { container } = render(<AdminStatusBadge>Default Badge</AdminStatusBadge>);
    const badge = container.firstChild as HTMLElement;

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
    expect(screen.getByText("Default Badge")).toBeInTheDocument();
  });

  it("renders live variant with pulsing dot indicator when dot is true", () => {
    const { container } = render(
      <AdminStatusBadge variant="live" dot>
        Live Now
      </AdminStatusBadge>,
    );
    expect(screen.getByText("Live Now")).toBeInTheDocument();

    const dot = container.querySelector(".animate-pulse");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("bg-emerald-500");
  });

  it("renders dot indicator when dot prop is explicitly true", () => {
    const { container } = render(
      <AdminStatusBadge variant="warning" dot>
        Pending Review
      </AdminStatusBadge>,
    );
    expect(screen.getByText("Pending Review")).toBeInTheDocument();

    const dot = container.querySelector(".rounded-full.shrink-0");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("bg-amber-500");
  });

  it("applies compact sizing styles when size='sm'", () => {
    const { container } = render(
      <AdminStatusBadge variant="active" size="sm">
        Active Small
      </AdminStatusBadge>,
    );
    const badge = container.firstChild as HTMLElement;

    expect(badge).toHaveClass("text-[11px]", "px-2");
  });

  const variantsToTest: Array<{ variant: AdminStatusVariant; label: string; textClass: string }> = [
    { variant: "active", label: "Active", textClass: "text-emerald-800" },
    { variant: "draft", label: "Draft", textClass: "text-zinc-700" },
    { variant: "upcoming", label: "Upcoming", textClass: "text-amber-800" },
    { variant: "danger", label: "Cancelled", textClass: "text-rose-800" },
    { variant: "info", label: "Info", textClass: "text-blue-800" },
    { variant: "flash", label: "Flash Sale", textClass: "text-purple-700" },
    { variant: "standard", label: "Standard Sale", textClass: "text-[#735639]" },
    { variant: "admin", label: "Admin Role", textClass: "text-indigo-800" },
    { variant: "staff", label: "Staff Role", textClass: "text-sky-800" },
    { variant: "user", label: "User Role", textClass: "text-slate-700" },
    { variant: "method-get", label: "GET", textClass: "text-blue-700" },
    { variant: "method-post", label: "POST", textClass: "text-emerald-700" },
    { variant: "method-put", label: "PUT", textClass: "text-amber-700" },
    { variant: "method-patch", label: "PATCH", textClass: "text-orange-700" },
    { variant: "method-delete", label: "DELETE", textClass: "text-rose-700" },
  ];

  variantsToTest.forEach(({ variant, label, textClass }) => {
    it(`renders variant='${variant}' with correct semantic color classes`, () => {
      const { container } = render(<AdminStatusBadge variant={variant}>{label}</AdminStatusBadge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(textClass);
    });
  });

  it("renders custom icon when provided", () => {
    render(
      <AdminStatusBadge icon={<span data-testid="custom-icon">⭐</span>}>
        Featured
      </AdminStatusBadge>,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("correctly resolves badge variant from helper functions", () => {
    expect(getStatusBadgeVariant("ACTIVE")).toBe("active");
    expect(getStatusBadgeVariant("DRAFT")).toBe("draft");
    expect(getStatusBadgeVariant("PENDING")).toBe("upcoming");
    expect(getStatusBadgeVariant("CANCELLED")).toBe("danger");
    expect(getStatusBadgeVariant("UNKNOWN")).toBe("neutral");

    expect(getHttpMethodVariant("GET")).toBe("method-get");
    expect(getHttpMethodVariant("POST")).toBe("method-post");
    expect(getHttpMethodVariant("PUT")).toBe("method-put");
    expect(getHttpMethodVariant("PATCH")).toBe("method-patch");
    expect(getHttpMethodVariant("DELETE")).toBe("method-delete");

    expect(getRoleBadgeVariant("ADMIN")).toBe("admin");
    expect(getRoleBadgeVariant("STAFF")).toBe("staff");
    expect(getRoleBadgeVariant("USER")).toBe("user");
  });
});
