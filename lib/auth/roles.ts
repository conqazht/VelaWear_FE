import type { User } from "@/lib/api/types";

export const ADMIN_HOME_PATH = "/dashboard/default";

export const MANAGEMENT_ROLE_NAMES = ["ADMIN", "MANAGER", "STAFF"] as const;

export function normalizeRoleName(role: unknown): string | null {
  const rawRole =
    typeof role === "string"
      ? role
      : role && typeof role === "object" && "name" in role
        ? (role as { name?: unknown }).name
        : null;

  if (typeof rawRole !== "string") return null;

  const normalizedRole = rawRole.trim().toUpperCase().replace(/^ROLE_/, "");
  return normalizedRole || null;
}

export function getUserRoleNames(user: Pick<User, "roles"> | null | undefined) {
  if (!Array.isArray(user?.roles)) return [];

  return Array.from(
    new Set(
      user.roles
        .map(normalizeRoleName)
        .filter((role): role is string => role !== null),
    ),
  );
}

export function hasAnyRole(
  user: Pick<User, "roles"> | null | undefined,
  allowedRoles: readonly string[],
) {
  const normalizedAllowedRoles = new Set(
    allowedRoles.map(normalizeRoleName).filter((role): role is string => role !== null),
  );

  return getUserRoleNames(user).some((role) => normalizedAllowedRoles.has(role));
}

export function canAccessManagement(user: Pick<User, "roles"> | null | undefined) {
  return hasAnyRole(user, MANAGEMENT_ROLE_NAMES);
}

export function getPrimaryRoleName(user: Pick<User, "roles"> | null | undefined) {
  const roleNames = getUserRoleNames(user);

  return (
    MANAGEMENT_ROLE_NAMES.find((role) => roleNames.includes(role)) ??
    roleNames[0] ??
    null
  );
}

export function getRoleSessionLabel(user: Pick<User, "roles"> | null | undefined) {
  return getPrimaryRoleName(user)?.toLowerCase().replaceAll("_", " ") ?? "account";
}

export function getPostSignInPath(user: Pick<User, "roles"> | null | undefined) {
  return canAccessManagement(user) ? ADMIN_HOME_PATH : "/";
}
