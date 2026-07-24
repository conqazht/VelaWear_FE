import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileNavigation } from "./profile-navigation";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/profile"),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("ProfileNavigation", () => {
  it("renders correctly", () => {
    vi.mocked(usePathname).mockReturnValue("/profile");
    render(<ProfileNavigation />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

});
