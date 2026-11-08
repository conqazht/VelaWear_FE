import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecentlyViewedDock } from "./recently-viewed-dock";

const mockUseRecentlyViewed = vi.fn();

vi.mock("@/hooks/use-recently-viewed", () => ({
  useRecentlyViewed: () => mockUseRecentlyViewed(),
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string, params?: { count?: number }) => {
      if (params?.count !== undefined) return `${key} (${params.count})`;
      return key;
    },
  }),
}));

vi.mock("@/components/shop/fashion-image", () => ({
  FashionImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe("RecentlyViewedDock", () => {
  const sampleItems = [
    {
      id: "linen-blazer",
      name: "Linen Blazer",
      price: 1850000,
      image: "/images/fixtures/products/linen-blazer/card.webp",
      category: "outerwear",
      timestamp: Date.now(),
    },
  ];

  const removeProduct = vi.fn();
  const clearAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when not loaded or items are empty", () => {
    mockUseRecentlyViewed.mockReturnValue({
      items: [],
      isLoaded: true,
      removeProduct,
      clearAll,
    });

    const { container } = render(<RecentlyViewedDock />);
    expect(container.firstChild).toBeNull();
  });

  it("renders trigger button when items exist", () => {
    mockUseRecentlyViewed.mockReturnValue({
      items: sampleItems,
      isLoaded: true,
      removeProduct,
      clearAll,
    });

    render(<RecentlyViewedDock />);
    expect(screen.getByRole("button", { name: "recentlyViewed.dockLabel" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens drawer when trigger button is clicked", async () => {
    const user = userEvent.setup();
    mockUseRecentlyViewed.mockReturnValue({
      items: sampleItems,
      isLoaded: true,
      removeProduct,
      clearAll,
    });

    render(<RecentlyViewedDock />);
    const trigger = screen.getByRole("button", { name: "recentlyViewed.dockLabel" });
    await user.click(trigger);

    expect(screen.getByRole("region", { name: "recentlyViewed.title" })).toBeInTheDocument();
    expect(screen.getByText("Linen Blazer")).toBeInTheDocument();
  });

  it("closes drawer when clicking outside", async () => {
    const user = userEvent.setup();
    mockUseRecentlyViewed.mockReturnValue({
      items: sampleItems,
      isLoaded: true,
      removeProduct,
      clearAll,
    });

    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <RecentlyViewedDock />
      </div>,
    );

    const trigger = screen.getByRole("button", { name: "recentlyViewed.dockLabel" });
    await user.click(trigger);
    expect(screen.getByRole("region", { name: "recentlyViewed.title" })).toBeInTheDocument();

    // Click outside
    const outside = screen.getByTestId("outside-element");
    fireEvent.pointerDown(outside);

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "recentlyViewed.title" }),
      ).not.toBeInTheDocument();
    });
  });

  it("closes drawer on Escape key", async () => {
    const user = userEvent.setup();
    mockUseRecentlyViewed.mockReturnValue({
      items: sampleItems,
      isLoaded: true,
      removeProduct,
      clearAll,
    });

    render(<RecentlyViewedDock />);
    const trigger = screen.getByRole("button", { name: "recentlyViewed.dockLabel" });
    await user.click(trigger);
    expect(screen.getByRole("region", { name: "recentlyViewed.title" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "recentlyViewed.title" }),
      ).not.toBeInTheDocument();
    });
  });
});
