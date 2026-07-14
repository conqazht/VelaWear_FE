"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DeleteResourceDialog,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import {
  ResourcePage,
  type ManagementColumn,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  downloadCsv,
  formatAdminDate,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminGender, AdminUser } from "@/lib/api/admin-rbac";
import {
  useAdminRolesQuery,
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminUserRolesMutation,
} from "@/lib/queries/admin-rbac";
import { getInitials } from "@/lib/utils";

import { UserFormSheet, type UserFormValues } from "./user-form-sheet";

type UserFormMode = "create" | "edit";
type SearchField = "fullName" | "email";

function resolveAvatarUrl(value: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, "");
    return `${backendOrigin}/${value.replace(/^\//, "")}`;
  }
  return value;
}

function RoleBadges({ user }: { user: AdminUser }) {
  if (user.roles.length === 0) {
    return <span className="text-muted-foreground text-sm">No roles</span>;
  }

  return (
    <div className="flex max-w-64 flex-wrap gap-1.5">
      {user.roles.slice(0, 2).map((role) => (
        <Badge key={role.id} variant="secondary">
          {role.name}
        </Badge>
      ))}
      {user.roles.length > 2 ? (
        <Badge variant="outline">+{user.roles.length - 2}</Badge>
      ) : null}
    </div>
  );
}

export function Users() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("fullName");
  const [gender, setGender] = useState<AdminGender | "ALL">("ALL");
  const [formMode, setFormMode] = useState<UserFormMode | null>(null);
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const usersQuery = useAdminUsersQuery({
    page,
    size: pageSize,
    sort: "createdAt,desc",
    ...(searchValue.trim()
      ? { [searchField]: searchValue.trim() }
      : {}),
    ...(gender === "ALL" ? {} : { gender }),
  });
  const rolesQuery = useAdminRolesQuery({
    page: 1,
    size: 500,
    sort: "name,asc",
  });
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const updateRolesMutation = useUpdateAdminUserRolesMutation();
  const deleteMutation = useDeleteAdminUserMutation();

  const rows = usersQuery.data?.result ?? [];
  const meta = usersQuery.data?.meta ?? {
    page,
    pageSize,
    pages: 0,
    total: 0,
  };
  const isFormPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolesMutation.isPending;

  function openCreate() {
    setActiveUser(null);
    setFormError(null);
    setFormMode("create");
  }

  function openEdit(user: AdminUser) {
    setActiveUser(user);
    setFormError(null);
    setFormMode("edit");
  }

  function closeForm(force = false) {
    if (isFormPending && !force) return;
    setFormMode(null);
    setActiveUser(null);
    setFormError(null);
  }

  async function handleUserSubmit(values: UserFormValues) {
    setFormError(null);

    if (formMode === "create") {
      try {
        const createdUser = await createMutation.mutateAsync({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          birthDate: values.birthDate,
          avatar: values.avatar.trim() || null,
          gender: values.gender,
        });

        try {
          await updateRolesMutation.mutateAsync({
            id: createdUser.id,
            request: { roles: values.roles },
          });
          toast.success("User created", {
            description: `${createdUser.fullName} can now sign in with the assigned access.`,
          });
        } catch (error) {
          toast.warning("User created without roles", {
            description: getApiErrorMessage(error),
          });
        }

        closeForm(true);
      } catch (error) {
        setFormError(getApiErrorMessage(error));
      }
      return;
    }

    if (!activeUser) return;

    try {
      await updateMutation.mutateAsync({
        id: activeUser.id,
        request: {
          fullName: values.fullName.trim(),
          birthDate: values.birthDate,
          avatar: values.avatar.trim() || null,
          gender: values.gender,
        },
      });

      const currentRoles = activeUser.roles.map((role) => role.name).sort();
      const nextRoles = [...values.roles].sort();
      if (currentRoles.join("|") !== nextRoles.join("|")) {
        await updateRolesMutation.mutateAsync({
          id: activeUser.id,
          request: { roles: values.roles },
        });
      }

      toast.success("User updated", {
        description: `${values.fullName.trim()}'s profile and access are up to date.`,
      });
      closeForm(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("User deleted", {
        description: `${deleteTarget.fullName} was removed from active user management.`,
      });
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Unable to delete user", {
        description: getApiErrorMessage(error),
      });
    }
  }

  const columns: ManagementColumn<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="flex min-w-64 items-center gap-3">
          <Avatar size="lg">
            {user.avatar ? (
              <AvatarImage src={resolveAvatarUrl(user.avatar)} alt="" />
            ) : null}
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.fullName}</p>
            <p className="text-muted-foreground truncate text-sm">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (user) => <RoleBadges user={user} />,
    },
    {
      key: "gender",
      header: "Gender",
      cell: (user) => (
        <span className="text-sm capitalize">{user.gender?.toLowerCase() ?? "—"}</span>
      ),
    },
    {
      key: "password",
      header: "Sign-in",
      cell: (user) => (
        <Badge variant={user.hasPassword ? "outline" : "secondary"}>
          {user.hasPassword ? "Password" : "Social only"}
        </Badge>
      ),
    },
    {
      key: "birthDate",
      header: "Birth date",
      cell: (user) => <span className="text-sm">{formatAdminDate(user.birthDate)}</span>,
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (user) => <span className="text-sm">{formatAdminDate(user.createdAt)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-16",
      className: "text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Open actions for ${user.fullName}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openEdit(user)}>
                <Pencil /> Edit user and roles
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={user.id === currentUser?.id}
              onClick={() => setDeleteTarget(user)}
            >
              <Trash2 /> {user.id === currentUser?.id ? "Current account is protected" : "Delete user"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title="Users"
        description="Manage customer and staff accounts, profile details, and role-based access."
        rows={rows}
        columns={columns}
        total={meta.total}
        page={meta.page || page}
        pageSize={meta.pageSize || pageSize}
        pageCount={meta.pages}
        searchValue={searchValue}
        searchPlaceholder={searchField === "email" ? "Search email..." : "Search name..."}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        filters={[
          {
            label: "Search by",
            value: searchField,
            options: [
              { label: "Full name", value: "fullName" },
              { label: "Email", value: "email" },
            ],
            onValueChange: (value) => {
              setSearchField((value as SearchField | null) ?? "fullName");
              setPage(1);
            },
          },
          {
            label: "Gender",
            value: gender,
            options: [
              { label: "All", value: "ALL" },
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
              { label: "Other", value: "OTHER" },
            ],
            onValueChange: (value) => {
              setGender((value as AdminGender | "ALL" | null) ?? "ALL");
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Add user", onClick: openCreate, icon: Plus }}
        onRefresh={() => void usersQuery.refetch()}
        onExport={() =>
          downloadCsv("vela-users.csv", rows.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate,
            roles: user.roles.map((role) => role.name).join(" | "),
            hasPassword: user.hasPassword ? "Yes" : "No",
            createdAt: user.createdAt,
          })))
        }
        isLoading={usersQuery.isPending}
        isFetching={usersQuery.isFetching}
        error={usersQuery.isError ? usersQuery.error : null}
        emptyTitle="No users found"
        emptyDescription="Try another filter or create the first managed account."
      />

      {formMode ? (
        <UserFormSheet
          mode={formMode}
          user={activeUser ?? undefined}
          availableRoles={rolesQuery.data?.result ?? []}
          isRolesLoading={rolesQuery.isPending}
          rolesError={rolesQuery.isError ? getApiErrorMessage(rolesQuery.error) : null}
          error={formError}
          isPending={isFormPending}
          onClose={() => closeForm()}
          onSubmit={handleUserSubmit}
        />
      ) : null}

      <DeleteResourceDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        resourceName={deleteTarget?.fullName ?? "user"}
        description="The account will be soft-deleted and disappear from active user management. Existing access tokens may remain valid until they expire."
        onConfirm={() => void handleDelete()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
