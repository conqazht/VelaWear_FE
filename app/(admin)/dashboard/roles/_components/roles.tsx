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
  formatAdminDate,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
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
        toast.success("Role created", {
          description: `${request.name} is ready for user assignment.`,
        });
      } else if (activeRole) {
        await updateMutation.mutateAsync({ id: activeRole.id, request });
        toast.success("Role updated", {
          description: `${request.name} was updated successfully.`,
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
      toast.success("Role deleted", {
        description: `${deleteTarget.name} and its user/permission links were removed.`,
      });
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Unable to delete role", {
        description: getApiErrorMessage(error),
      });
    }
  }

  const columns: ManagementColumn<AdminRole>[] = [
    {
      key: "name",
      header: "Role",
      cell: (role) => (
        <div className="min-w-44">
          <p className="font-medium">{role.name}</p>
          <p className="text-muted-foreground text-xs tabular-nums">ID {role.id}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "max-w-md",
      cell: (role) => (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {role.description || "No description"}
        </p>
      ),
    },
    {
      key: "access",
      header: "Access map",
      cell: () => <Badge variant="outline">Available in details</Badge>,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (role) => <span className="text-sm">{formatAdminDate(role.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (role) => <span className="text-sm">{formatAdminDate(role.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
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
                aria-label={`Open actions for ${role.name}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openEdit(role)}>
                <Pencil /> Edit and inspect access
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isProtectedRole}
              onClick={() => setDeleteTarget(role)}
            >
              <Trash2 /> {isProtectedRole ? "Core role is protected" : "Delete role"}
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
        title="Roles"
        description="Create named access roles and inspect the permissions currently assigned by the backend."
        rows={rows}
        columns={columns}
        total={meta.total}
        page={meta.page || page}
        pageSize={meta.pageSize || pageSize}
        pageCount={meta.pages}
        searchValue={searchValue}
        searchPlaceholder={
          searchField === "description" ? "Search descriptions..." : "Search role names..."
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
            label: "Search by",
            value: searchField,
            options: [
              { label: "Name", value: "name" },
              { label: "Description", value: "description" },
            ],
            onValueChange: (value) => {
              setSearchField((value as SearchField | null) ?? "name");
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Create role", onClick: openCreate, icon: Plus }}
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
        error={rolesQuery.isError ? getApiErrorMessage(rolesQuery.error) : null}
        emptyTitle="No roles found"
        emptyDescription="Try another search or create a role for your access model."
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
        resourceName={deleteTarget?.name ?? "role"}
        description="This hard-deletes the role and cascades every user-role and role-permission link. The backend does not protect system roles or the last administrator."
        onConfirm={() => void handleDelete()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
