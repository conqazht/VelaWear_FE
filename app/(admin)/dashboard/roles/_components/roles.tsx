"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DeleteResourceDialog } from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import {
  ResourcePage,
  type ManagementColumn,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  downloadCsv,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
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
import type { AdminRole } from "@/lib/api/admin-rbac";
import { formatDate } from "@/lib/i18n/format";
import {
  useAdminRoleQuery,
  useAdminRolesQuery,
  useCreateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useUpdateAdminRoleMutation,
} from "@/lib/queries/admin-rbac";

import { RoleFormSheet, type RoleFormValues } from "./role-form-sheet";

type SearchField = "name" | "description";
type RoleFormMode = "create" | "edit";
const PROTECTED_ROLE_NAMES = new Set(["ADMIN", "MANAGER", "STAFF", "USER"]);

export function Roles() {
  const { locale, t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [formMode, setFormMode] = useState<RoleFormMode | null>(null);
  const [activeRole, setActiveRole] = useState<AdminRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const rolesQuery = useAdminRolesQuery({
    page,
    size: pageSize,
    sort: "createdAt,desc",
    ...(searchValue.trim() ? { [searchField]: searchValue.trim() } : {}),
  });
  const roleDetailQuery = useAdminRoleQuery(
    formMode === "edit" ? activeRole?.id : undefined
  );
  const createMutation = useCreateAdminRoleMutation();
  const updateMutation = useUpdateAdminRoleMutation();
  const deleteMutation = useDeleteAdminRoleMutation();

  const rows = rolesQuery.data?.result ?? [];
  const meta = rolesQuery.data?.meta ?? {
    page,
    pageSize,
    pages: 0,
    total: 0,
  };
  const isFormPending = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setActiveRole(null);
    setFormError(null);
    setFormMode("create");
  }

  function openEdit(role: AdminRole) {
    setActiveRole(role);
    setFormError(null);
    setFormMode("edit");
  }

  function closeForm(force = false) {
    if (isFormPending && !force) return;
    setFormMode(null);
    setActiveRole(null);
    setFormError(null);
  }

  async function handleSubmit(values: RoleFormValues) {
    setFormError(null);
    const request = {
      name: values.name.trim(),
      description: values.description.trim() || null,
    };

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(request);
        toast.success(t("admin.commerce.roles.created"), {
          description: t("admin.commerce.roles.createdDescription", { name: request.name }),
        });
      } else if (activeRole) {
        await updateMutation.mutateAsync({ id: activeRole.id, request });
        toast.success(t("admin.commerce.roles.updated"), {
          description: t("admin.commerce.roles.updatedDescription", { name: request.name }),
        });
      }
      closeForm(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("admin.commerce.roles.deleted"), {
        description: t("admin.commerce.roles.deletedDescription", { name: deleteTarget.name }),
      });
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(t("admin.commerce.roles.unableDelete"), {
        description: getApiErrorMessage(error),
      });
    }
  }

  const columns: ManagementColumn<AdminRole>[] = [
    {
      key: "name",
      header: t("admin.commerce.roles.column.role"),
      cell: (role) => (
        <div className="min-w-44">
          <p className="font-medium">{role.name}</p>
          <p className="text-muted-foreground text-xs tabular-nums">
            {t("admin.commerce.roles.id", { id: role.id })}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: t("admin.commerce.common.description"),
      className: "max-w-md",
      cell: (role) => (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {role.description || t("admin.commerce.common.noDescription")}
        </p>
      ),
    },
    {
      key: "access",
      header: t("admin.commerce.roles.column.accessMap"),
      cell: () => <Badge variant="outline">{t("admin.commerce.roles.availableDetails")}</Badge>,
    },
    {
      key: "createdAt",
      header: t("admin.commerce.common.created"),
      cell: (role) => <span className="text-sm">{formatDate(role.createdAt, locale)}</span>,
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      cell: (role) => <span className="text-sm">{formatDate(role.updatedAt, locale)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-16",
      className: "text-right",
      cell: (role) => {
        const isProtectedRole = PROTECTED_ROLE_NAMES.has(role.name.toUpperCase());

        return (
          <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("admin.commerce.common.openActions", { name: role.name })}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openEdit(role)}>
                <Pencil /> {t("admin.commerce.roles.editInspect")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isProtectedRole}
              onClick={() => setDeleteTarget(role)}
            >
              <Trash2 />
              {isProtectedRole
                ? t("admin.commerce.roles.protected")
                : t("admin.commerce.roles.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.roles.title")}
        description={t("admin.commerce.roles.description")}
        rows={rows}
        columns={columns}
        total={meta.total}
        page={meta.page || page}
        pageSize={meta.pageSize || pageSize}
        pageCount={meta.pages}
        searchValue={searchValue}
        searchPlaceholder={
          searchField === "description"
            ? t("admin.commerce.roles.searchDescriptions")
            : t("admin.commerce.roles.searchNames")
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
            label: t("admin.commerce.roles.searchBy"),
            value: searchField,
            options: [
              { label: t("admin.commerce.roles.name"), value: "name" },
              { label: t("admin.commerce.common.description"), value: "description" },
            ],
            onValueChange: (value) => {
              setSearchField((value as SearchField | null) ?? "name");
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: t("admin.commerce.roles.create"), onClick: openCreate, icon: Plus }}
        onRefresh={() => void rolesQuery.refetch()}
        onExport={() =>
          downloadCsv("vela-roles.csv", rows.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          })))
        }
        isLoading={rolesQuery.isPending}
        isFetching={rolesQuery.isFetching}
        error={rolesQuery.isError ? rolesQuery.error : null}
        emptyTitle={t("admin.commerce.roles.emptyTitle")}
        emptyDescription={t("admin.commerce.roles.emptyDescription")}
      />

      {formMode ? (
        <RoleFormSheet
          mode={formMode}
          role={activeRole ?? undefined}
          permissions={roleDetailQuery.data?.permissions ?? []}
          isPermissionsLoading={roleDetailQuery.isPending && formMode === "edit"}
          permissionsError={
            roleDetailQuery.isError ? getApiErrorMessage(roleDetailQuery.error) : null
          }
          error={formError}
          isPending={isFormPending}
          onClose={() => closeForm()}
          onSubmit={handleSubmit}
        />
      ) : null}

      <DeleteResourceDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        resourceName={deleteTarget?.name ?? t("admin.commerce.roles.resource")}
        description={t("admin.commerce.roles.deleteDescription")}
        onConfirm={() => void handleDelete()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
