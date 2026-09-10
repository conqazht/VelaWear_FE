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

export function useMyNotificationsQuery(params: NotificationFilterParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.myList(params),
    queryFn: () => getMyNotifications(params),
    enabled,
  });
}

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchInterval: 45000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
      const previousCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount());

      if (typeof previousCount === "number") {
        queryClient.setQueryData<number>(
          queryKeys.notifications.unreadCount(),
          Math.max(0, previousCount - 1),
        );
      }

      return { previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.root,
      });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
      const previousCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount());

      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);

      return { previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.root,
      });
    },
  });
}
