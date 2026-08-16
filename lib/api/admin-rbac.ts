import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { PageParams, ResultPaginationDTO } from "./types";

export type AdminGender = "MALE" | "FEMALE" | "OTHER";

export type AdminRoleSummary = {
  id: number;
  name: string;
};

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  birthDate: string | null;
  avatar: string | null;
  gender: AdminGender | null;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  roles: AdminRoleSummary[];
};

export type AdminPermission = {
  id: number;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminRole = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: AdminPermission[];
};

export type AdminUserFilters = PageParams & {
  fullName?: string;
  email?: string;
  gender?: AdminGender;
  birthDateFrom?: string;
  birthDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type AdminRoleFilters = PageParams & {
  name?: string;
  description?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type AdminPermissionFilters = PageParams & {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type CreateAdminUserRequest = {
  fullName: string;
  email: string;
  password: string;
  birthDate: string;
  avatar?: string | null;
  gender: AdminGender;
};

export type UpdateAdminUserRequest = {
  fullName: string;
  birthDate: string;
  avatar?: string | null;
  gender: AdminGender;
};

export type UpdateAdminUserRolesRequest = {
  roles: string[];
};

export type CreateAdminRoleRequest = {
  name: string;
  description?: string | null;
};

export type UpdateAdminRoleRequest = CreateAdminRoleRequest;

export type CreateAdminPermissionRequest = {
  name: string;
  apiPath: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  module: string;
};

export type UpdateAdminPermissionRequest = CreateAdminPermissionRequest;

export function getAdminUsers(filters: AdminUserFilters = {}) {
  return apiGet<ResultPaginationDTO<AdminUser>>("/users", filters);
}

export function getAdminUser(id: number) {
  return apiGet<AdminUser>(`/users/${id}`);
}

export function createAdminUser(request: CreateAdminUserRequest) {
  return apiPost<AdminUser, CreateAdminUserRequest>("/users", request);
}

export function updateAdminUser(id: number, request: UpdateAdminUserRequest) {
  return apiPut<AdminUser, UpdateAdminUserRequest>(`/users/${id}`, request);
}

export function updateAdminUserRoles(id: number, request: UpdateAdminUserRolesRequest) {
  return apiPut<AdminUser, UpdateAdminUserRolesRequest>(`/users/${id}/roles`, request);
}

export function deleteAdminUser(id: number) {
  return apiDelete<void>(`/users/${id}`);
}

export function getAdminRoles(filters: AdminRoleFilters = {}) {
  return apiGet<ResultPaginationDTO<AdminRole>>("/roles", filters);
}

export function getAdminRole(id: number) {
  return apiGet<AdminRole>(`/roles/${id}`);
}

export function createAdminRole(request: CreateAdminRoleRequest) {
  return apiPost<AdminRole, CreateAdminRoleRequest>("/roles", request);
}

export function updateAdminRole(id: number, request: UpdateAdminRoleRequest) {
  return apiPut<AdminRole, UpdateAdminRoleRequest>(`/roles/${id}`, request);
}

export function deleteAdminRole(id: number) {
  return apiDelete<void>(`/roles/${id}`);
}

export function getAdminPermissions(filters: AdminPermissionFilters = {}) {
  return apiGet<ResultPaginationDTO<AdminPermission>>("/permissions", filters);
}

export function getAdminPermission(id: number) {
  return apiGet<AdminPermission>(`/permissions/${id}`);
}

export function createAdminPermission(request: CreateAdminPermissionRequest) {
  return apiPost<AdminPermission, CreateAdminPermissionRequest>("/permissions", request);
}

export function updateAdminPermission(id: number, request: UpdateAdminPermissionRequest) {
  return apiPut<AdminPermission, UpdateAdminPermissionRequest>(`/permissions/${id}`, request);
}

export function deleteAdminPermission(id: number) {
  return apiDelete<void>(`/permissions/${id}`);
}
