import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NotificationBell } from "./notification-bell";

const mockUnreadCount = vi.fn();
const mockNotificationsQuery = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/use-notifications", () => ({
  useUnreadNotificationCountQuery: () => ({
    data: mockUnreadCount(),
  }),
  useMyNotificationsQuery: () => ({
    data: mockNotificationsQuery(),
    isLoading: false,
    isError: false,
  }),
  useMarkNotificationAsReadMutation: () => ({
    mutate: mockMarkRead,
  }),
  useMarkAllNotificationsAsReadMutation: () => ({
    mutate: mockMarkAllRead,
    isPending: false,
  }),
}));

describe("NotificationBell", () => {
  it("renders bell icon without badge when unread count is 0", () => {
    mockUnreadCount.mockReturnValue(0);
    mockNotificationsQuery.mockReturnValue({ meta: { total: 0 }, result: [] });

    render(<NotificationBell />);

    const button = screen.getByRole("button", { name: "notifications.title" });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders badge when unread count is greater than 0", () => {
    mockUnreadCount.mockReturnValue(3);
    mockNotificationsQuery.mockReturnValue({ meta: { total: 3 }, result: [] });

    render(<NotificationBell />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens dropdown and shows notifications on click", async () => {
    const user = userEvent.setup();
    mockUnreadCount.mockReturnValue(1);
    mockNotificationsQuery.mockReturnValue({
      meta: { total: 1, page: 1, pageSize: 8, pages: 1 },
      result: [
        {
          id: 1,
          title: "Đơn hàng đã được xác nhận",
          content: "Shop đang chuẩn bị hàng",
          type: "ORDER_UPDATE",
          targetType: "ORDER",
          targetId: "VELA-001",
          linkUrl: "/profile/orders/VELA-001",
          imageUrl: null,
          isRead: false,
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(<NotificationBell />);

    const button = screen.getByRole("button", { name: "notifications.title" });
    await user.click(button);

    expect(screen.getByText("Đơn hàng đã được xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Shop đang chuẩn bị hàng")).toBeInTheDocument();
  });
});
