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
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
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
import { formatDate } from "@/lib/i18n/format";
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

const GENDER_MESSAGE_KEYS = {
  MALE: "admin.commerce.users.gender.male",
  FEMALE: "admin.commerce.users.gender.female",
  OTHER: "admin.commerce.users.gender.other",
} as const;

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
  const { t } = useI18n();

  if (user.roles.length === 0) {
    return <span className="text-muted-foreground text-sm">{t("admin.commerce.users.noRoles")}</span>;
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
  const { locale, t } = useI18n();
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
          toast.success(t("admin.commerce.users.created"), {
            description: t("admin.commerce.users.createdDescription", { name: createdUser.fullName }),
          });
        } catch (error) {
          toast.warning(t("admin.commerce.users.createdWithoutRoles"), {
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

      toast.success(t("admin.commerce.users.updated"), {
        description: t("admin.commerce.users.updatedDescription", { name: values.fullName.trim() }),
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
      toast.success(t("admin.commerce.users.deleted"), {
        description: t("admin.commerce.users.deletedDescription", { name: deleteTarget.fullName }),
      });
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(t("admin.commerce.users.unableDelete"), {
        description: getApiErrorMessage(error),
      });
    }
  }

  const columns: ManagementColumn<AdminUser>[] = [
    {
      key: "user",
      header: t("admin.commerce.users.column.user"),
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
      header: t("admin.commerce.users.column.roles"),
      cell: (user) => <RoleBadges user={user} />,
    },
    {
      key: "gender",
      header: t("admin.commerce.users.column.gender"),
      cell: (user) => (
        <span className="text-sm">
          {user.gender ? t(GENDER_MESSAGE_KEYS[user.gender]) : "—"}
        </span>
      ),
    },
    {
      key: "password",
      header: t("admin.commerce.users.column.signIn"),
      cell: (user) => (
        <Badge variant={user.hasPassword ? "outline" : "secondary"}>
          {user.hasPassword
            ? t("admin.commerce.users.signIn.password")
            : t("admin.commerce.users.signIn.socialOnly")}
        </Badge>
      ),
    },
    {
      key: "birthDate",
      header: t("admin.commerce.users.column.birthDate"),
      cell: (user) => (
        <span className="text-sm">
          {user.birthDate ? formatDate(user.birthDate, locale) : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("admin.commerce.users.column.joined"),
      cell: (user) => <span className="text-sm">{formatDate(user.createdAt, locale)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-16",
      className: "text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("admin.commerce.common.openActions", { name: user.fullName })}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openEdit(user)}>
                <Pencil /> {t("admin.commerce.users.edit")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={user.id === currentUser?.id}
              onClick={() => setDeleteTarget(user)}
            >
              <Trash2 />
              {user.id === currentUser?.id
                ? t("admin.commerce.users.protected")
                : t("admin.commerce.users.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.users.title")}
        description={t("admin.commerce.users.description")}
        rows={rows}
        columns={columns}
        total={meta.total}
        page={meta.page || page}
        pageSize={meta.pageSize || pageSize}
        pageCount={meta.pages}
        searchValue={searchValue}
        searchPlaceholder={
          searchField === "email"
            ? t("admin.commerce.users.searchEmail")
            : t("admin.commerce.users.searchName")
        }
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
            label: t("admin.commerce.users.searchBy"),
            value: searchField,
            options: [
              { label: t("admin.commerce.users.fullName"), value: "fullName" },
              { label: t("admin.commerce.users.email"), value: "email" },
            ],
            onValueChange: (value) => {
              setSearchField((value as SearchField | null) ?? "fullName");
              setPage(1);
            },
          },
          {
            label: t("admin.commerce.users.column.gender"),
            value: gender,
            options: [
              { label: t("admin.commerce.common.all"), value: "ALL" },
              { label: t("admin.commerce.users.gender.male"), value: "MALE" },
              { label: t("admin.commerce.users.gender.female"), value: "FEMALE" },
              { label: t("admin.commerce.users.gender.other"), value: "OTHER" },
            ],
            onValueChange: (value) => {
              setGender((value as AdminGender | "ALL" | null) ?? "ALL");
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: t("admin.commerce.users.add"), onClick: openCreate, icon: Plus }}
        onRefresh={() => void usersQuery.refetch()}
        onExport={() =>
          downloadCsv("vela-users.csv", rows.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate,
            roles: user.roles.map((role) => role.name).join(" | "),
            hasPassword: user.hasPassword
              ? t("admin.commerce.users.csvYes")
              : t("admin.commerce.users.csvNo"),
            createdAt: user.createdAt,
          })))
        }
        isLoading={usersQuery.isPending}
        isFetching={usersQuery.isFetching}
        error={usersQuery.isError ? usersQuery.error : null}
        emptyTitle={t("admin.commerce.users.emptyTitle")}
        emptyDescription={t("admin.commerce.users.emptyDescription")}
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
        resourceName={deleteTarget?.fullName ?? t("admin.commerce.users.resource")}
        description={t("admin.commerce.users.deleteDescription")}
        onConfirm={() => void handleDelete()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
