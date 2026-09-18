"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import type { NotificationFilterParams } from "@/lib/api/types";
import { queryKeys } from "./keys";

export function useMyNotificationsQuery(
  accountId?: number,
  params: NotificationFilterParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.notifications.myList(accountId, params),
    queryFn: () => getMyNotifications(params),
    enabled: enabled && typeof accountId === "number",
  });
}

export function useUnreadNotificationCountQuery(accountId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(accountId),
    queryFn: getUnreadNotificationCount,
    enabled: enabled && typeof accountId === "number",
    refetchInterval: 45000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsReadMutation(accountId?: number) {
  const queryClient = useQueryClient();
  const unreadKey = queryKeys.notifications.unreadCount(accountId);

  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: unreadKey,
      });
      const previousCount = queryClient.getQueryData<number>(unreadKey);

      if (typeof previousCount === "number") {
        queryClient.setQueryData<number>(
          unreadKey,
          Math.max(0, previousCount - 1),
        );
      }

      return { previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(unreadKey, context.previousCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.root,
      });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation(accountId?: number) {
  const queryClient = useQueryClient();
  const unreadKey = queryKeys.notifications.unreadCount(accountId);

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: unreadKey,
      });
      const previousCount = queryClient.getQueryData<number>(unreadKey);

      queryClient.setQueryData<number>(unreadKey, 0);

      return { previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(unreadKey, context.previousCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.root,
      });
    },
  });
}
