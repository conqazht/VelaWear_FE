import { apiGet, apiPut } from "./client";
import type {
  NotificationFilterParams,
  NotificationItem,
  ResultPaginationDTO,
  UnreadNotificationCount,
} from "./types";

export async function getMyNotifications(
  params?: NotificationFilterParams,
): Promise<ResultPaginationDTO<NotificationItem>> {
  return apiGet<ResultPaginationDTO<NotificationItem>>(
    "/api/v1/notifications/me",
    params as Record<string, unknown> | undefined,
  );
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await apiGet<UnreadNotificationCount>("/api/v1/notifications/me/unread-count");
  return result.unreadCount;
}

export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  return apiPut<NotificationItem, Record<string, never>>(`/api/v1/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiPut<void, Record<string, never>>("/api/v1/notifications/me/read-all", {});
}
