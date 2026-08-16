"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminPermission,
  createAdminRole,
  createAdminUser,
  deleteAdminPermission,
  deleteAdminRole,
  deleteAdminUser,
  getAdminPermission,
  getAdminPermissions,
  getAdminRole,
  getAdminRoles,
  getAdminUser,
  getAdminUsers,
  updateAdminPermission,
  updateAdminRole,
  updateAdminUser,
  updateAdminUserRoles,
  type AdminPermissionFilters,
  type AdminRoleFilters,
  type AdminUserFilters,
  type CreateAdminPermissionRequest,
  type CreateAdminRoleRequest,
  type CreateAdminUserRequest,
  type UpdateAdminPermissionRequest,
  type UpdateAdminRoleRequest,
  type UpdateAdminUserRequest,
  type UpdateAdminUserRolesRequest,
} from "@/lib/api/admin-rbac";

export const adminRbacKeys = {
  root: ["admin-rbac"] as const,
  users: {
    root: ["admin-rbac", "users"] as const,
    list: (filters: AdminUserFilters) => ["admin-rbac", "users", "list", filters] as const,
    detail: (id: number) => ["admin-rbac", "users", "detail", id] as const,
  },
  roles: {
    root: ["admin-rbac", "roles"] as const,
    list: (filters: AdminRoleFilters) => ["admin-rbac", "roles", "list", filters] as const,
    detail: (id: number) => ["admin-rbac", "roles", "detail", id] as const,
  },
  permissions: {
    root: ["admin-rbac", "permissions"] as const,
    list: (filters: AdminPermissionFilters) =>
      ["admin-rbac", "permissions", "list", filters] as const,
    detail: (id: number) => ["admin-rbac", "permissions", "detail", id] as const,
  },
};

export function useAdminUsersQuery(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: adminRbacKeys.users.list(filters),
    queryFn: () => getAdminUsers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserQuery(id?: number) {
  return useQuery({
    queryKey: adminRbacKeys.users.detail(id ?? 0),
    queryFn: () => getAdminUser(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAdminUserRequest) => createAdminUser(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminUserRequest }) =>
      updateAdminUser(id, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root }),
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.users.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useUpdateAdminUserRolesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminUserRolesRequest }) =>
      updateAdminUserRoles(id, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root }),
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.users.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root });
    },
  });
}

export function useAdminRolesQuery(filters: AdminRoleFilters = {}) {
  return useQuery({
    queryKey: adminRbacKeys.roles.list(filters),
    queryFn: () => getAdminRoles(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRoleQuery(id?: number) {
  return useQuery({
    queryKey: adminRbacKeys.roles.detail(id ?? 0),
    queryFn: () => getAdminRole(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAdminRoleRequest) => createAdminRole(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRbacKeys.roles.root });
    },
  });
}

export function useUpdateAdminRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminRoleRequest }) =>
      updateAdminRole(id, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.roles.root }),
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root }),
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.roles.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteAdminRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminRole,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.roles.root }),
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.users.root }),
      ]);
    },
  });
}

export function useAdminPermissionsQuery(filters: AdminPermissionFilters = {}) {
  return useQuery({
    queryKey: adminRbacKeys.permissions.list(filters),
    queryFn: () => getAdminPermissions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPermissionQuery(id?: number) {
  return useQuery({
    queryKey: adminRbacKeys.permissions.detail(id ?? 0),
    queryFn: () => getAdminPermission(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminPermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAdminPermissionRequest) => createAdminPermission(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminRbacKeys.permissions.root,
      });
    },
  });
}

export function useUpdateAdminPermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminPermissionRequest }) =>
      updateAdminPermission(id, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.permissions.root,
        }),
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.roles.root }),
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.permissions.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteAdminPermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminPermission,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminRbacKeys.permissions.root,
        }),
        queryClient.invalidateQueries({ queryKey: adminRbacKeys.roles.root }),
      ]);
    },
  });
}
