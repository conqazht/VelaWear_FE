import { beforeEach, describe, expect, it, vi } from "vitest";

const clientMocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock("@/lib/api/client", () => clientMocks);

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";

describe("notifications API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getMyNotifications with relative path without duplicated /api/v1 prefix", async () => {
    clientMocks.apiGet.mockResolvedValue({
      meta: { page: 1, pageSize: 10, pages: 1, total: 0 },
      result: [],
    });

    await getMyNotifications({ page: 1, size: 10 });

    expect(clientMocks.apiGet).toHaveBeenCalledWith("/notifications/me", {
      page: 1,
      size: 10,
    });
  });

  it("calls getUnreadNotificationCount with relative path", async () => {
    clientMocks.apiGet.mockResolvedValue({ unreadCount: 5 });

    const count = await getUnreadNotificationCount();

    expect(clientMocks.apiGet).toHaveBeenCalledWith("/notifications/me/unread-count");
    expect(count).toBe(5);
  });

  it("calls markNotificationAsRead with relative path", async () => {
    clientMocks.apiPut.mockResolvedValue({
      id: 12,
      title: "Test",
      isRead: true,
    });

    await markNotificationAsRead(12);

    expect(clientMocks.apiPut).toHaveBeenCalledWith("/notifications/12/read", {});
  });

  it("calls markAllNotificationsAsRead with relative path", async () => {
    clientMocks.apiPut.mockResolvedValue(undefined);

    await markAllNotificationsAsRead();

    expect(clientMocks.apiPut).toHaveBeenCalledWith("/notifications/me/read-all", {});
  });
});
